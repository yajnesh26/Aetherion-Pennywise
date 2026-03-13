import { useState, useEffect } from "react";
import { Plus, Target, TrendingUp } from "lucide-react";
import GoalCard from "../components/GoalCard";
import { useAuth } from "../contexts/AuthContext";
import { fetchGoals, addGoal, removeGoal, fetchTransactions } from "../services/firestore";
import { calculateDailySavingRate } from "../utils/savingsUtils";

export default function Goals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", target: "", productLink: "" });
  const [savingRate, setSavingRate] = useState(10);

  useEffect(() => {
    if (!user) return;
    fetchGoals(user.uid).then(setGoals).catch(console.error);
    fetchTransactions(user.uid).then(txs => {
      const rate = calculateDailySavingRate(txs);
      setSavingRate(rate);
    }).catch(console.error);
  }, [user]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.target) return;

    let normalizedLink = (form.productLink || "").trim();
    if (normalizedLink && !normalizedLink.startsWith("http")) {
      normalizedLink = "https://" + normalizedLink;
    }

    const goalData = {
      name: form.name,
      target: Number(form.target),
      productLink: normalizedLink,
      saved: 0,
      dailySaving: Math.ceil(Number(form.target) / 60),
    };

    try {
      const saved = await addGoal(user.uid, goalData);
      setGoals([saved, ...goals]);
    } catch (err) {
      console.error(err);
    }
    setForm({ name: "", target: "", productLink: "" });
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    try {
      await removeGoal(id);
      setGoals(goals.filter((g) => g.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <Target className="w-8 h-8 text-primary" />
            Savings Goals
          </h1>
          <p className="text-slate-400 mt-1">
            Empower your future. Crush your savings goals.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-slate-900 font-bold rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-5 h-5" />
          Add New Goal
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-6 border border-slate-700/50">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Goals</p>
          <p className="text-2xl font-bold text-white">{goals.length}</p>
        </div>
        <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-6 border border-slate-700/50">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Completed</p>
          <p className="text-2xl font-bold text-emerald-400">
            {goals.filter(g => Number(g.saved) >= Number(g.target)).length}
          </p>
        </div>
        <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-6 border border-slate-700/50">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Saved</p>
          <p className="text-2xl font-bold text-primary">
            ₹{goals.reduce((acc, g) => acc + (Number(g.saved) || 0), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Add Goal Form */}
      {showForm && (
        <div className="bg-slate-800/60 backdrop-blur rounded-2xl border border-slate-700/50 p-6 mb-8 animate-fadeIn">
          <h3 className="text-lg font-semibold text-white mb-4">Set a New Goal</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5 pl-1">
                  Goal Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. New Smartphone"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm text-white placeholder-slate-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5 pl-1">
                  Target Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  value={form.target}
                  onChange={(e) => setForm({ ...form, target: e.target.value })}
                  placeholder="e.g. 25000"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm text-white placeholder-slate-500 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5 pl-1">
                Product Link (Optional)
              </label>
              <input
                type="text"
                value={form.productLink}
                onChange={(e) => setForm({ ...form, productLink: e.target.value })}
                placeholder="Paste Amazon/Flipkart link here"
                className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm text-white placeholder:text-slate-500 transition-all"
              />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-2 bg-primary text-slate-900 font-bold rounded-xl hover:bg-emerald-400 transition-all"
              >
                Create Goal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="text-center py-20 bg-slate-800/30 rounded-3xl border border-dashed border-slate-700">
          <Target className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <h3 className="text-slate-400 font-medium">No savings goals yet</h3>
          <p className="text-slate-500 text-sm mt-1">Start your savings journey by adding a new goal.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onDelete={handleDelete}
              savingRate={savingRate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
