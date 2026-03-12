import GoalRow from "./GoalRow";
import { Target, Wallet, TrendingUp, PartyPopper, ShoppingCart, ExternalLink, ImageOff } from "lucide-react";

/**
 * GoalsTable — Wallet-based goals table. Each goal is independently evaluated
 * against the central savings wallet balance.
 *
 * Props:
 *  - goals          : [ { id, name, target, image?, url? } ]
 *  - totalSavings   : number  — central wallet balance
 *  - dailySaving    : number  — average daily saving rate
 *  - onDelete       : (id) => void
 *  - onSelect       : (goal) => void
 *  - onBuy          : (goal) => void
 *  - selectedGoal   : goal object or null
 */
export default function GoalsTable({
  goals,
  totalSavings = 0,
  dailySaving = 50,
  onDelete,
  onSelect,
  onBuy,
  selectedGoal,
}) {
  if (goals.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700/40 p-12 text-center">
        <Target className="w-14 h-14 text-slate-700 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-400 mb-1">No goals yet</h3>
        <p className="text-slate-500 text-sm">
          Click "Add Goal" to start saving towards something you want
        </p>
      </div>
    );
  }

  const readyCount = goals.filter((g) => totalSavings >= g.target).length;

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700/40 overflow-hidden shadow-xl shadow-black/10">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-800/80 border-b border-slate-700/50">
              <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Item
              </th>
              <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Target Price
              </th>
              <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Remaining
              </th>
              <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider min-w-[180px]">
                Progress
              </th>
              <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                ETA
              </th>
              <th className="px-4 py-3.5 w-24" />
            </tr>
          </thead>
          <tbody>
            {goals.map((goal, i) => (
              <GoalRow
                key={goal.id}
                goal={goal}
                totalSavings={totalSavings}
                dailySaving={dailySaving}
                isLast={i === goals.length - 1}
                onDelete={onDelete}
                onSelect={onSelect}
                onBuy={onBuy}
                isSelected={selectedGoal?.id === goal.id}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards (responsive fallback) */}
      <div className="md:hidden divide-y divide-slate-700/30">
        {goals.map((goal) => {
          const isReady = totalSavings >= goal.target;
          const remaining = Math.max(goal.target - totalSavings, 0);
          const progress = Math.min((totalSavings / goal.target) * 100, 100);
          const daysLeft = !isReady
            ? Math.max(Math.ceil(remaining / (dailySaving || 50)), 0)
            : 0;
          const isSelected = selectedGoal?.id === goal.id;

          return (
            <div
              key={goal.id}
              onClick={() => onSelect?.(goal)}
              className={`p-4 cursor-pointer transition-all ${
                isReady ? "border-l-2 border-l-emerald-500/60" : "border-l-2 border-l-transparent"
              } ${isSelected ? "bg-emerald-500/[0.07]" : "hover:bg-slate-800/60"}`}
            >
              <div className="flex items-start gap-3 mb-3">
                {/* Mobile image thumbnail */}
                {goal.image ? (
                  <div className="w-12 h-12 rounded-lg bg-white/5 border border-slate-700/40 overflow-hidden shrink-0">
                    <img
                      src={goal.image}
                      alt={goal.name}
                      className="w-full h-full object-contain"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-slate-700/30 border border-slate-700/40 flex items-center justify-center shrink-0">
                    <ImageOff className="w-4 h-4 text-slate-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white truncate">{goal.name}</h3>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {isReady ? (
                        <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                          <PartyPopper className="w-3 h-3" /> Ready 🎉
                        </span>
                      ) : (
                        <span className="text-xs text-indigo-400 font-medium flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> ~{daysLeft}d
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete?.(goal.id);
                        }}
                        className="p-1 rounded hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
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

              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span>₹{Math.min(totalSavings, goal.target).toLocaleString("en-IN")} / ₹{goal.target.toLocaleString("en-IN")}</span>
                {!isReady && (
                  <span className="text-amber-400/80">₹{remaining.toLocaleString("en-IN")} left</span>
                )}
              </div>

              <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
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

              <div className="flex items-center justify-between mt-2 text-xs">
                <span className="text-slate-500">{progress.toFixed(0)}%</span>
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
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-semibold rounded-md transition-colors"
                  >
                    <ShoppingCart className="w-3 h-3" /> Buy Now
                    {goal.url && <ExternalLink className="w-2.5 h-2.5 ml-0.5" />}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary row — central wallet */}
      <div className="bg-slate-800/80 border-t border-slate-700/50 px-4 py-3 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {goals.length} goal{goals.length !== 1 ? "s" : ""} •{" "}
          {readyCount} ready to buy
        </span>
        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
          <Wallet className="w-3.5 h-3.5" />
          Savings Wallet: ₹{totalSavings.toLocaleString("en-IN")}
        </span>
      </div>
    </div>
  );
}
