import { Target, Lock, PartyPopper, ShoppingCart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * WalletGoalCard — Dashboard card showing savings wallet summary
 * and the nearest affordable goal (or cheapest goal being saved toward).
 *
 * Props:
 *  - goals        : [ { name, target } ]  — all goals
 *  - totalSavings : number  — central wallet balance
 */
export default function PriorityGoalCard({ goals = [], totalSavings = 0 }) {
  if (!goals || goals.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700/40 p-5 text-center">
        <Lock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="text-sm text-slate-400">No goals set yet.</p>
        <Link
          to="/goals"
          className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          Add your first goal <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    );
  }

  const readyGoals = goals.filter((g) => totalSavings >= g.target);
  const savingGoals = goals.filter((g) => totalSavings < g.target);

  // Show the cheapest "saving" goal as the next target, or first ready goal
  const featuredGoal = savingGoals.length > 0
    ? savingGoals.reduce((a, b) => (a.target - totalSavings < b.target - totalSavings ? a : b))
    : readyGoals[0];

  const remaining = Math.max(featuredGoal.target - totalSavings, 0);
  const progress = Math.min((totalSavings / featuredGoal.target) * 100, 100);
  const isReady = totalSavings >= featuredGoal.target;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 transition-all ${
        readyGoals.length > 0
          ? "bg-gradient-to-br from-emerald-500/15 to-teal-500/10 border-emerald-500/30"
          : "bg-slate-800/50 backdrop-blur border-slate-700/40"
      }`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              readyGoals.length > 0 ? "bg-emerald-500/20" : "bg-indigo-500/15"
            }`}
          >
            {readyGoals.length > 0 ? (
              <PartyPopper className="w-5 h-5 text-emerald-400" />
            ) : (
              <Target className="w-5 h-5 text-indigo-400" />
            )}
          </div>
          <div>
            {readyGoals.length > 0 ? (
              <p className="text-xs text-emerald-400 uppercase tracking-wider font-semibold">
                {readyGoals.length} item{readyGoals.length !== 1 ? "s" : ""} ready to buy!
              </p>
            ) : (
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Closest Goal
              </p>
            )}
            <h3 className="text-lg font-bold text-white leading-tight mt-0.5">
              {featuredGoal.name}
            </h3>
          </div>
        </div>

        <Link
          to="/goals"
          className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors shrink-0 mt-1"
        >
          All Goals <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Amounts */}
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-xs text-slate-500">Savings Wallet</p>
          <p className="text-xl font-bold text-white font-mono">
            ₹{totalSavings.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Target</p>
          <p className="text-sm font-semibold text-slate-300 font-mono">
            ₹{featuredGoal.target.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2.5 bg-slate-700/50 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            isReady
              ? "bg-gradient-to-r from-emerald-400 to-teal-400"
              : "bg-gradient-to-r from-indigo-500 to-violet-500"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Footer info */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {isReady ? (
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <ShoppingCart className="w-3.5 h-3.5" /> Ready to Buy! 🎉
            </span>
          ) : (
            <>
              ₹{remaining.toLocaleString("en-IN")} remaining
            </>
          )}
        </p>
        <p className="text-xs font-semibold text-slate-400">
          {progress.toFixed(0)}%
        </p>
      </div>

      {/* Subtle glow on ready */}
      {readyGoals.length > 0 && (
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
      )}
    </div>
  );
}
