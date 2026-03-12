import { useState, useEffect } from "react";
import { Plus, Target } from "lucide-react";
import GoalCard from "../components/GoalCard";
import { useAuth } from "../contexts/AuthContext";
import { fetchGoals, addGoal, removeGoal } from "../services/firestore";

export default function Goals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", target: "" });

  useEffect(() => {
    if (!user) return;
    fetchGoals(user.uid).then(setGoals).catch(console.error);
  }, [user]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.target) return;

    const goalData = {
      name: form.name,
      target: Number(form.target),
      saved: 0,
      dailySaving: Math.ceil(Number(form.target) / 60),
    };

    try {
      const saved = await addGoal(user.uid, goalData);
      setGoals([saved, ...goals]);
    } catch (err) {
      console.error(err);
    }
    setForm({ name: "", target: "" });
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <Target className="w-8 h-8 text-primary" />
            Your Goals
          </h1>
          <p className="text-slate-400 mt-1">
            Track and manage your savings goals
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-emerald-400 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-200 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Goal
        </button>
      </div>

      {/* Add Goal Form */}
      {showForm && (
        <div className="bg-slate-800/60 backdrop-blur rounded-2xl border border-slate-700/50 p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">
            Create New Goal
          </h3>
          <form
            onSubmit={handleAdd}
            className="flex flex-col sm:flex-row gap-4"
          >
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Item Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. New Laptop"
                className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm text-white placeholder-slate-500 transition-all"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Target Price (₹)
              </label>
              <input
                type="number"
                value={form.target}
                onChange={(e) => setForm({ ...form, target: e.target.value })}
                placeholder="e.g. 50000"
                min="1"
                className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm text-white placeholder-slate-500 transition-all"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors text-sm"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="text-center py-16">
          <Target className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-400">No goals yet</h3>
          <p className="text-slate-500 text-sm mt-1">
            Click "Add Goal" to start saving towards something
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
