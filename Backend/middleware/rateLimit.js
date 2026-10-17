"use strict";

/**
 * SEC-02 — Dependency-free, in-memory, fixed-window rate limiter.
 *
 * Design notes:
 * - State is a per-process Map. It does NOT provide shared rate limiting
 *   across multiple server instances or worker processes.
 * - Counters are keyed strictly by `req.ip`. Express `trust proxy` is left
 *   untouched; with it disabled `req.ip` is the socket peer address.
 * - A request whose client IP cannot be validated is failed closed (503)
 *   instead of being grouped under a shared "unknown" key.
 * - When the tracked-key capacity is reached, requests from brand-new IPs are
 *   failed closed (503). Active (unexpired) counters are never evicted to make
 *   room, since that would let an attacker bypass limits by cycling IPs.
 * - No timers are created: expired entries are purged during requests, so the
 *   limiter never keeps the process alive.
 * - All state mutations are synchronous (no awaits), so the counter updates
 *   are safe under Node's single-threaded request handling.
 */

const net = require("net");

const DEFAULT_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_MAX = 10;
const DEFAULT_MAX_KEYS = 10000;
const DEFAULT_UNAVAILABLE_RETRY_AFTER_S = 60;

const TOO_MANY_MESSAGE = "Too many requests. Please try again later.";
const UNAVAILABLE_MESSAGE =
  "Service temporarily unavailable. Please try again later.";

/**
 * Resolve and validate the client IP key from a request.
 * Returns a normalized IP string, or null when it is missing or malformed.
 */
function clientKey(req) {
  const ip = req && typeof req.ip === "string" ? req.ip : null;
  if (!ip || ip.length > 64) return null;
  // Strip an IPv6 zone index (e.g. "fe80::1%eth0") before validation.
  const normalized = ip.split("%")[0];
  return net.isIP(normalized) ? normalized : null;
}

function setRetryAfter(res, seconds) {
  // Retry-After must be an integer number of seconds, rounded up.
  res.set("Retry-After", String(Math.max(1, Math.ceil(seconds))));
}

/**
 * Create a fixed-window rate-limiting middleware.
 *
 * @param {object} [options]
 * @param {number} [options.windowMs]  Window length in ms.
 * @param {number} [options.max]       Allowed requests per window per key.
 * @param {number} [options.maxKeys]   Maximum number of tracked keys.
 * @param {number} [options.unavailableRetryAfterS] Retry-After for 503s.
 * @returns {import("express").RequestHandler}
 */
function createRateLimiter(options = {}) {
  const windowMs =
    Number(options.windowMs) > 0 ? Number(options.windowMs) : DEFAULT_WINDOW_MS;
  const max = Number(options.max) > 0 ? Number(options.max) : DEFAULT_MAX;
  const maxKeys =
    Number(options.maxKeys) > 0 ? Number(options.maxKeys) : DEFAULT_MAX_KEYS;
  const unavailableRetryAfterS =
    Number(options.unavailableRetryAfterS) > 0
      ? Number(options.unavailableRetryAfterS)
      : DEFAULT_UNAVAILABLE_RETRY_AFTER_S;

  // key -> { count, resetAt }
  const buckets = new Map();
  let nextSweepAt = 0;

  // Purge only expired counters; unexpired counters are never removed.
  function sweep(now) {
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  }

  function rateLimiter(req, res, next) {
    const key = clientKey(req);

    // Fail closed on an unvalidated client IP: never create a shared fallback
    // bucket, which would incorrectly group unrelated clients together.
    if (key === null) {
      setRetryAfter(res, unavailableRetryAfterS);
      return res
        .status(503)
        .json({ success: false, message: UNAVAILABLE_MESSAGE });
    }

    const now = Date.now();

    // Opportunistic sweep, at most once per window (no timers involved).
    if (now >= nextSweepAt) {
      sweep(now);
      nextSweepAt = now + windowMs;
    }

    let bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      // A brand-new key must respect the key-capacity bound. Existing keys
      // (even with an expired window) reuse their slot, so they never grow the
      // map. Expired slots are reclaimed before failing closed.
      if (!buckets.has(key) && buckets.size >= maxKeys) {
        sweep(now);
        if (buckets.size >= maxKeys) {
          setRetryAfter(res, unavailableRetryAfterS);
          return res
            .status(503)
            .json({ success: false, message: UNAVAILABLE_MESSAGE });
        }
      }
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }

    bucket.count += 1;

    if (bucket.count > max) {
      // Fixed window: the client may retry once the current window resets.
      setRetryAfter(res, (bucket.resetAt - now) / 1000);
      return res
        .status(429)
        .json({ success: false, message: TOO_MANY_MESSAGE });
    }

    return next();
  }

  return rateLimiter;
}

module.exports = { createRateLimiter };
