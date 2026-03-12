import { useState } from "react";
import {
  Link2,
  Search,
  Loader2,
  Plus,
  AlertCircle,
  ExternalLink,
  ImageOff,
  X,
} from "lucide-react";
import { fetchProduct } from "../services/api";

/**
 * AddGoalFromLink — paste a product URL and auto-extract name, price, and image.
 *
 * Props:
 *  - onAddGoal : ({ name, target, image, url }) => void
 *  - onClose   : () => void
 */
export default function AddGoalFromLink({ onAddGoal, onClose }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [product, setProduct] = useState(null); // fetched product
  const [partial, setPartial] = useState(false); // true = URL-slug fallback
  const [manualPrice, setManualPrice] = useState("");
  const [nickname, setNickname] = useState("");
  const [imgError, setImgError] = useState(false);

  const handleFetch = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    setProduct(null);
    setPartial(false);
    setManualPrice("");
    setNickname("");
    setImgError(false);

    try {
      const res = await fetchProduct({ url: url.trim() });

      if (res.data.success && res.data.product) {
        setProduct(res.data.product);
        setPartial(!!res.data.partial);

        // If price was null from scraper, prompt manual entry
        if (!res.data.product.price) {
          setManualPrice("");
        }
      } else {
        setError(res.data.message || "Could not fetch product data.");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Failed to fetch product. Check the URL and try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleFetch();
    }
  };

  const handleAddGoal = () => {
    if (!product) return;
    const price = manualPrice ? Number(manualPrice) : product.price;
    if (!price || price <= 0) {
      setError("Please enter a valid price to continue.");
      return;
    }

    onAddGoal({
      name: nickname || product.name,
      target: price,
      image: imgError ? null : product.image,
      url: product.url,
    });

    // Reset
    setUrl("");
    setProduct(null);
    setManualPrice("");
    setNickname("");
    setError("");
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700/40 p-6 animate-slideUp">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center">
            <Link2 className="w-4.5 h-4.5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">
              Add from Product Link
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Paste an Amazon or Flipkart URL to auto-fill goal details
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* URL Input */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://www.amazon.in/dp/B0... or flipkart.com/..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm text-white placeholder-slate-500 transition-all"
          />
        </div>
        <button
          onClick={handleFetch}
          disabled={loading || !url.trim()}
          className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-xl transition-colors text-sm shrink-0"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          {loading ? "Fetching…" : "Fetch"}
        </button>
      </div>

      {/* Supported platforms hint */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold">
          Supported:
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 bg-slate-700/40 px-2 py-0.5 rounded-md">
            🛒 Amazon.in
          </span>
          <span className="text-[11px] text-slate-400 bg-slate-700/40 px-2 py-0.5 rounded-md">
            🛍️ Flipkart.com
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Product Preview Card */}
      {product && (
        <div className="bg-slate-900/50 border border-slate-700/40 rounded-2xl overflow-hidden">
          <div className="flex flex-col sm:flex-row">
            {/* Image */}
            <div className="sm:w-44 h-44 sm:h-auto bg-white/5 flex items-center justify-center shrink-0 p-3">
              {product.image && !imgError ? (
                <img
                  src={product.image}
                  alt={product.name}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-600">
                  <ImageOff className="w-8 h-8" />
                  <span className="text-[10px]">No image</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 p-5 flex flex-col justify-between">
              <div>
                {/* Platform badge */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                    {product.platform}
                  </span>
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-slate-500 hover:text-indigo-400 flex items-center gap-1 transition-colors"
                  >
                    View on site <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Partial-data banner */}
                {partial && (
                  <div className="mb-2 flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-[10px] text-amber-400">
                      The site blocked full scraping — name was extracted from the URL. Please verify & enter the price manually.
                    </span>
                  </div>
                )}

                {/* Product name */}
                <h4 className="text-sm font-bold text-white leading-snug mb-3">
                  {product.name}
                </h4>

                {/* Nickname input */}
                <div className="mb-3">
                  <span className="text-[11px] text-slate-500">
                    Give this goal a nickname
                  </span>

                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="e.g. Gaming Mouse"
                    className="mt-1 w-full px-3 py-2 rounded-lg bg-slate-800/70 border border-slate-600/40 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none text-xs text-white placeholder-slate-600 transition-all"
                  />
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-3">
                  {product.price ? (
                    <>
                      <span className="text-xl font-bold text-emerald-400 font-mono">
                        ₹{product.price.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Extracted price
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-amber-400 font-semibold">
                      ⚠️ Price not found — please enter manually below
                    </span>
                  )}
                </div>

                {/* Manual price override */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">
                    {product.price ? "Price not right?" : "Enter target price (₹)"}
                  </span>
                  <input
                    type="number"
                    value={manualPrice}
                    onChange={(e) => setManualPrice(e.target.value)}
                    placeholder={product.price ? "Override price" : "e.g. 2999"}
                    min="1"
                    className={`w-36 px-3 py-1.5 rounded-lg bg-slate-800/70 border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none text-xs text-white placeholder-slate-600 transition-all ${
                      !product.price
                        ? "border-amber-500/50 ring-1 ring-amber-500/20"
                        : "border-slate-600/40"
                    }`}
                    autoFocus={!product.price}
                  />
                </div>
              </div>

              {/* Add button */}
              <button
                onClick={handleAddGoal}
                className="mt-4 inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-all text-sm"
              >
                <Plus className="w-4 h-4" />
                Add to Goals
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="bg-slate-900/50 border border-slate-700/40 rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row gap-5">
            <div className="sm:w-44 h-36 bg-slate-700/30 rounded-xl animate-pulse" />
            <div className="flex-1 space-y-3">
              <div className="w-20 h-4 bg-slate-700/30 rounded animate-pulse" />
              <div className="w-3/4 h-5 bg-slate-700/30 rounded animate-pulse" />
              <div className="w-1/3 h-7 bg-slate-700/30 rounded animate-pulse" />
              <div className="w-40 h-10 bg-slate-700/30 rounded-xl animate-pulse mt-4" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
