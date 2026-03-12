import { useState, useEffect } from "react";
import {
  PiggyBank,
  Target,
  Flame,
  ArrowUpRight,
  TrendingUp,
  Clock,
} from "lucide-react";
import GoalCard from "../components/GoalCard";
// import { getDashboard } from "../services/api";

// ── Dummy data (replace with API later) ───────────────────
const dummyStats = {
  totalSavings: 8450,
  activeGoals: 4,
  streak: 12,
};

const dummyGoals = [
  { id: 1, name: "iPhone 16", target: 79900, saved: 32000, dailySaving: 800 },
  { id: 2, name: "Goa Trip", target: 25000, saved: 18500, dailySaving: 400 },
  { id: 3, name: "PS5 Controller", target: 5900, saved: 4200, dailySaving: 150 },
  { id: 4, name: "New Sneakers", target: 8500, saved: 1200, dailySaving: 200 },
];

const dummyTransactions = [
  { id: 1, desc: "Swiggy Order", amount: 287, roundUp: 13, date: "Today" },
  { id: 2, desc: "Uber Ride", amount: 142, roundUp: 8, date: "Today" },
  { id: 3, desc: "Amazon Purchase", amount: 1263, roundUp: 37, date: "Yesterday" },
  { id: 4, desc: "Coffee", amount: 85, roundUp: 15, date: "Yesterday" },
];

export default function Dashboard() {
  const [stats, setStats] = useState(dummyStats);
  const [goals, setGoals] = useState(dummyGoals);
  const [transactions] = useState(dummyTransactions);

  useEffect(() => {
    // Uncomment when backend is ready:
    // getDashboard().then(res => {
    //   setStats(res.data.stats);
    //   setGoals(res.data.goals);
    // });
  }, []);

  const statCards = [
    {
      label: "Total Savings",
      value: `₹${stats.totalSavings.toLocaleString("en-IN")}`,
      icon: PiggyBank,
      color: "from-primary to-emerald-400",
      bg: "bg-emerald-500/10",
      iconColor: "text-primary",
    },
    {
      label: "Active Goals",
      value: stats.activeGoals,
      icon: Target,
      color: "from-accent to-indigo-400",
      bg: "bg-indigo-500/10",
      iconColor: "text-accent",
    },
    {
      label: "Savings Streak",
      value: `${stats.streak} days`,
      icon: Flame,
      color: "from-orange-400 to-amber-400",
      bg: "bg-orange-500/10",
      iconColor: "text-orange-400",
    },
    {
      label: "This Month",
      value: `₹${(2340).toLocaleString("en-IN")}`,
      icon: TrendingUp,
      color: "from-pink-400 to-rose-400",
      bg: "bg-pink-500/10",
      iconColor: "text-pink-400",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Good morning! 👋
        </h1>
        <p className="text-slate-400 mt-1">
          Here's how your savings are doing
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-slate-800/60 backdrop-blur rounded-2xl p-5 border border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-800/80 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-600" />
              </div>
              <p className="text-2xl font-bold text-white">{card.value}</p>
              <p className="text-sm text-slate-400 mt-0.5">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Goals Section */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Your Goals</h2>
            <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700/50">
              {goals.length} active
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              Recent Round-Ups
            </h2>
            <Clock className="w-4 h-4 text-slate-600" />
          </div>
          <div className="bg-slate-800/60 backdrop-blur rounded-2xl border border-slate-700/50 divide-y divide-slate-700/30">
            {transactions.map((tx) => (
              <div key={tx.id} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-200">{tx.desc}</p>
                  <p className="text-xs text-slate-500">{tx.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">₹{tx.amount}</p>
                  <p className="text-xs font-semibold text-primary">
                    +₹{tx.roundUp} saved
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
