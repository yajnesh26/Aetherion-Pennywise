import { PiggyBank, Target, Flame, TrendingUp } from "lucide-react";

export default function SavingsCard({ totalSavings = 0, activeGoals = 0, streak = 0, roundUpsToday = 0 }) {
  const stats = [
    {
      icon: PiggyBank,
      label: "Total Saved",
      value: `₹${totalSavings.toLocaleString()}`,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      ring: "ring-emerald-500/20",
    },
    {
      icon: Target,
      label: "Active Goals",
      value: activeGoals,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
      ring: "ring-violet-500/20",
    },
    {
      icon: Flame,
      label: "Day Streak",
      value: `${streak} 🔥`,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      ring: "ring-amber-500/20",
    },
    {
      icon: TrendingUp,
      label: "Round-Ups Today",
      value: roundUpsToday,
      color: "text-sky-400",
      bg: "bg-sky-500/10",
      ring: "ring-sky-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-slate-800/50 border border-slate-700/40 rounded-2xl p-4 flex flex-col gap-2 hover:bg-slate-800/70 transition-all duration-200"
          >
            <div className={`w-9 h-9 rounded-lg ${stat.bg} ring-1 ${stat.ring} flex items-center justify-center`}>
              <Icon className={`w-4.5 h-4.5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight">{stat.value}</p>
              <p className="text-slate-500 text-xs font-medium mt-0.5">{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
