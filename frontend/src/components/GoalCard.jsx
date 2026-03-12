import { Target, TrendingUp, Trash2 } from "lucide-react";
import ProgressBar from "./ProgressBar";

export default function GoalCard({ goal, onDelete }) {
  const daysLeft = Math.max(
    Math.ceil((goal.target - goal.saved) / (goal.dailySaving || 50)),
    0
  );

  return (
    <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-5 border border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-800/80 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{goal.name}</h3>
            <p className="text-xs text-slate-500">Target: ₹{goal.target.toLocaleString("en-IN")}</p>
          </div>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(goal.id)}
            className="p-2 rounded-lg hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Progress */}
      <ProgressBar current={goal.saved} target={goal.target} />

      {/* Prediction */}
      <div className="mt-3">
        <div className="tag tag-emerald inline-flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-200" />
          <span className="text-xs">
            {goal.saved >= goal.target
              ? "🎉 Goal achieved!"
              : `You can buy this in ~${daysLeft} days`}
          </span>
        </div>
      </div>
    </div>
  );
}
