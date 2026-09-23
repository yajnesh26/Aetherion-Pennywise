export function parseUPIQR(data) {
  try {
    const url = new URL(data);

    // Only genuine UPI QR payloads are accepted: the data must use the
    // "upi:" protocol AND contain a non-empty payee address (pa).
    if (url.protocol !== "upi:") return null;

    const pa = url.searchParams.get("pa");
    if (!pa) return null;

    return {
      upi: pa,
      name: decodeURIComponent(url.searchParams.get("pn") || "UPI Merchant"),
    };
  } catch {
    return null;
  }
}