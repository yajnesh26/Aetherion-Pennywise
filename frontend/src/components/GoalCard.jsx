import { Target, TrendingUp, Trash2, ExternalLink, LineChart as ChartIcon } from "lucide-react";
import ProgressBar from "./ProgressBar";
import SavingsProjectionChart from "./SavingsProjectionChart";
import { generateProjectionData } from "../utils/savingsUtils";

export default function GoalCard({ goal, onDelete, savingRate = 10 }) {
  const saved = Number(goal.saved) || 0;
  const target = Number(goal.target) || 0;
  const daily = Number(goal.dailySaving) || 50;

  const daysLeft = Math.max(
    Math.ceil((target - saved) / daily),
    0
  );

  const percent = target > 0 ? Math.min(Math.round((saved / target) * 100), 100) : 0;
  const isAchieved = saved >= target;
  const remaining = Math.max(target - saved, 0);
  const sixtyDayDaily = Math.ceil(remaining / 60);
  const projectionData = generateProjectionData(goal, savingRate);

  return (
    <div className={`bg-slate-800/60 backdrop-blur rounded-2xl p-6 border ${isAchieved ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700/50'}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{goal.name}</h3>
            <p className="text-primary font-bold text-sm">₹{target.toLocaleString()}</p>
          </div>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(goal.id)}
            className="p-2 text-slate-500 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Progress */}
      <div className="space-y-4 mb-6">
        <div>
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                <span className="text-slate-500">Progress</span>
                <span className="text-emerald-400">{percent}% Complete</span>
            </div>
            <ProgressBar progress={percent} />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/40 rounded-xl p-3 border border-slate-700/20">
                <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Saved</p>
                <p className="text-sm font-bold text-white">₹{saved.toLocaleString()}</p>
            </div>
            <div className="bg-slate-900/40 rounded-xl p-3 border border-slate-700/20">
                <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Remaining</p>
                <p className="text-sm font-bold text-slate-300">₹{remaining.toLocaleString()}</p>
            </div>
        </div>

        {!isAchieved && (
            <div className="flex items-center gap-2 px-3 py-2 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
                <TrendingUp className="w-3 h-3 text-indigo-400" />
                <p className="text-[10px] text-slate-400">
                    Save <span className="text-white font-bold">₹{sixtyDayDaily}/day</span> to reach in 60 days
                </p>
            </div>
        )}

        {!isAchieved && projectionData.length > 1 && (
          <div className="pt-2 animate-fadeIn">
            <div className="flex items-center gap-1.5 mb-2 ml-1">
              <ChartIcon className="w-3 h-3 text-slate-500" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Savings Projection</span>
            </div>
            <SavingsProjectionChart data={projectionData} target={target} />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-700/30">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-slate-400">
            {isAchieved ? "Goal achieved!" : `${daysLeft} days left`}
          </span>
        </div>
        
        {isAchieved ? (
          <a
            href={
              goal.productLink 
                ? (goal.productLink.startsWith('http') ? goal.productLink : `https://${goal.productLink}`)
                : `https://www.amazon.in/s?k=${encodeURIComponent(goal.name)}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-emerald-400 flex items-center gap-1 hover:underline"
          >
            Buy Now →
          </a>
        ) : (
          goal.productLink && (
            <a
              href={goal.productLink.startsWith('http') ? goal.productLink : `https://${goal.productLink}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-slate-400 flex items-center gap-1 hover:text-white transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              View Product
            </a>
          )
        )}
      </div>
    </div>
  );
}
