import { useState } from "react";
import {
  Link2,
  Search,
  Loader2,
  ShoppingBag,
  Plus,
  AlertCircle,
  ExternalLink,
  ImageOff,
  X,
} from "lucide-react";

// ── Simulated product database (replace with real scraper / API later) ──
const MOCK_PRODUCTS = {
  "amazon.in": [
    {
      pattern: /sneaker|shoe|nike|adidas|puma/i,
      name: "Nike Air Max 90",
      price: 3499,
      image:
        "https://m.media-amazon.com/images/I/71GZNHP+XAL._AC_SL1500_.jpg",
    },
    {
      pattern: /headphone|earphone|buds|sony|jbl|boat/i,
      name: "Sony WH-1000XM5 Wireless Headphones",
      price: 2499,
      image:
        "https://m.media-amazon.com/images/I/51aXvjzcukL._AC_SL1500_.jpg",
    },
    {
      pattern: /controller|gamepad|ps5|xbox/i,
      name: "PS5 DualSense Wireless Controller",
      price: 5899,
      image:
        "https://m.media-amazon.com/images/I/61lsPklJzAL._AC_SL1500_.jpg",
    },
    {
      pattern: /watch|smartwatch|band/i,
      name: "Apple Watch SE (2nd Gen)",
      price: 24900,
      image:
        "https://m.media-amazon.com/images/I/71lmOluzBFL._AC_SL1500_.jpg",
    },
    {
      pattern: /bat|cricket/i,
      name: "SG English Willow Cricket Bat",
      price: 1799,
      image:
        "https://m.media-amazon.com/images/I/41WjQoL5lNL._AC_SL1200_.jpg",
    },
    {
      pattern: /keyboard|mechanical/i,
      name: "Cosmic Byte CB-GK-18 Mechanical Keyboard",
      price: 2799,
      image:
        "https://m.media-amazon.com/images/I/61CGHv6kmWL._AC_SL1000_.jpg",
    },
  ],
  "flipkart.com": [
    {
      pattern: /phone|mobile|samsung|iphone|pixel/i,
      name: "Samsung Galaxy S24 FE 5G",
      price: 29999,
      image:
        "https://rukminim2.flatsatic.com/image/416/416/xif0q/mobile/q/h/o/-original-imah4zz8gzqnihyg.jpeg",
    },
    {
      pattern: /laptop|notebook|macbook|lenovo/i,
      name: "Lenovo IdeaPad Slim 3",
      price: 42990,
      image:
        "https://rukminim2.flatsatic.com/image/416/416/xif0q/computer/q/a/o/-original-imah4zz8rwzeh8hr.jpeg",
    },
    {
      pattern: /sneaker|shoe|nike|adidas/i,
      name: "Adidas Ultraboost Light Running Shoes",
      price: 4299,
      image:
        "https://rukminim2.flatsatic.com/image/416/416/xif0q/shoe/m/n/x/-original-imah4zz8eqwufhvc.jpeg",
    },
  ],
};

/**
 * Simulate fetching product data from a URL.
 * In production, replace with a real backend scraper endpoint.
 */
function simulateFetch(url) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const urlLower = url.toLowerCase();

        // Detect platform
        let platform = null;
        if (urlLower.includes("amazon")) platform = "amazon.in";
        else if (urlLower.includes("flipkart")) platform = "flipkart.com";

        if (!platform) {
          return reject(
            new Error("Unsupported platform. Try an Amazon or Flipkart link.")
          );
        }

        const products = MOCK_PRODUCTS[platform];
        // Try to match URL keywords to a mock product
        const matched = products.find((p) => p.pattern.test(urlLower));

        if (matched) {
          return resolve({
            name: matched.name,
            price: matched.price,
            image: matched.image,
            url: url,
            platform: platform === "amazon.in" ? "Amazon" : "Flipkart",
          });
        }

        // Random fallback for unrecognized products on supported platforms
        const fallback = products[Math.floor(Math.random() * products.length)];
        resolve({
          name: fallback.name,
          price: fallback.price,
          image: fallback.image,
          url: url,
          platform: platform === "amazon.in" ? "Amazon" : "Flipkart",
        });
      } catch {
        reject(new Error("Failed to extract product data."));
      }
    }, 1500); // Simulate network delay
  });
}

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
  const [manualPrice, setManualPrice] = useState("");
  const [imgError, setImgError] = useState(false);

  const handleFetch = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    setProduct(null);
    setManualPrice("");
    setImgError(false);

    try {
      const data = await simulateFetch(url.trim());
      setProduct(data);
    } catch (err) {
      setError(err.message || "Could not fetch product data.");
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
    if (!price || price <= 0) return;

    onAddGoal({
      name: product.name,
      target: price,
      image: imgError ? null : product.image,
      url: product.url,
    });

    // Reset
    setUrl("");
    setProduct(null);
    setManualPrice("");
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

                {/* Product name */}
                <h4 className="text-sm font-bold text-white leading-snug mb-3">
                  {product.name}
                </h4>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-xl font-bold text-emerald-400 font-mono">
                    ₹{product.price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Extracted price
                  </span>
                </div>

                {/* Manual price override */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">
                    Price not right?
                  </span>
                  <input
                    type="number"
                    value={manualPrice}
                    onChange={(e) => setManualPrice(e.target.value)}
                    placeholder="Enter manually"
                    min="1"
                    className="w-36 px-3 py-1.5 rounded-lg bg-slate-800/70 border border-slate-600/40 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none text-xs text-white placeholder-slate-600 transition-all"
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
