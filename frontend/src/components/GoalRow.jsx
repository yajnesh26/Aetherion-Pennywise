import { TrendingUp, PartyPopper, ShoppingCart, ExternalLink, ImageOff } from "lucide-react";

/**
 * GoalRow — single table row for a wallet-based goal.
 *
 * Props:
 *  - goal          : { id, name, target, image?, url? }
 *  - totalSavings  : number  — central wallet balance
 *  - onDelete      : (id) => void
 *  - onSelect      : (goal) => void
 *  - onBuy         : (goal) => void
 *  - isSelected    : boolean
 *  - isLast        : boolean
 *  - dailySaving   : number  — avg daily saving rate for prediction
 */
export default function GoalRow({
  goal,
  totalSavings = 0,
  onDelete,
  onSelect,
  onBuy,
  isSelected,
  isLast,
  dailySaving = 50,
}) {
  const isReady = totalSavings >= goal.target;
  const remaining = Math.max(goal.target - totalSavings, 0);
  const progress = Math.min((totalSavings / goal.target) * 100, 100);
  const daysLeft = !isReady
    ? Math.max(Math.ceil(remaining / (dailySaving || 50)), 0)
    : 0;

  return (
    <tr
      onClick={() => onSelect?.(goal)}
      className={`group cursor-pointer transition-all duration-200 ${
        isReady ? "bg-emerald-500/[0.04]" : ""
      } ${isSelected ? "bg-emerald-500/[0.07]" : "hover:bg-slate-800/60"} ${
        !isLast ? "border-b border-slate-700/30" : ""
      } ${isReady ? "border-l-2 border-l-emerald-500/60" : "border-l-2 border-l-transparent"}`}
    >
      {/* Item Name + Image */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          {goal.image ? (
            <div className="w-10 h-10 rounded-lg bg-white/5 border border-slate-700/40 overflow-hidden shrink-0">
              <img
                src={goal.image}
                alt={goal.name}
                className="w-full h-full object-contain"
                onError={(e) => { e.target.style.display = "none"; }}
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-slate-700/30 border border-slate-700/40 flex items-center justify-center shrink-0">
              <ImageOff className="w-4 h-4 text-slate-600" />
            </div>
          )}
          <div className="min-w-0">
            <span className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors block truncate">
              {goal.name}
            </span>
            {goal.url && (
              <a
                href={goal.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-[10px] text-slate-500 hover:text-indigo-400 flex items-center gap-0.5 transition-colors mt-0.5"
              >
                View product <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
        </div>
      </td>

      {/* Target Price */}
      <td className="px-4 py-4">
        <span className="text-sm text-slate-300 font-mono">
          ₹{goal.target.toLocaleString("en-IN")}
        </span>
      </td>

      {/* Remaining */}
      <td className="px-4 py-4">
        {isReady ? (
          <span className="text-xs font-semibold text-emerald-400">₹0</span>
        ) : (
          <span className="text-sm text-amber-400/90 font-mono">
            ₹{remaining.toLocaleString("en-IN")}
          </span>
        )}
      </td>

      {/* Progress Bar */}
      <td className="px-4 py-4 min-w-[160px]">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2.5 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progress}%`,
                background: isReady
                  ? "linear-gradient(90deg, #10b981, #059669)"
                  : progress >= 50
                  ? "linear-gradient(90deg, #10b981, #34d399)"
                  : "linear-gradient(90deg, #6366f1, #818cf8)",
              }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-400 w-10 text-right tabular-nums">
            {progress.toFixed(0)}%
          </span>
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-4">
        {isReady ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
            <PartyPopper className="w-3 h-3" /> Ready to Buy 🎉
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full">
            <TrendingUp className="w-3 h-3" /> Saving
          </span>
        )}
      </td>

      {/* Prediction / ETA */}
      <td className="px-4 py-4">
        {isReady ? (
          <span className="text-xs font-semibold text-emerald-400">Available Now</span>
        ) : (
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-xs text-emerald-400 font-medium whitespace-nowrap">
              ~{daysLeft} days
            </span>
          </div>
        )}
      </td>

      {/* Actions */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-1.5">
          {isReady && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (goal.url) {
                  window.open(goal.url, "_blank", "noopener,noreferrer");
                } else {
                  onBuy?.(goal);
                }
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm shadow-emerald-500/20"
            >
              <ShoppingCart className="w-3 h-3" /> Buy Now
              {goal.url && <ExternalLink className="w-2.5 h-2.5 ml-0.5" />}
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(goal.id);
            }}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-all"
            title="Delete goal"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}
