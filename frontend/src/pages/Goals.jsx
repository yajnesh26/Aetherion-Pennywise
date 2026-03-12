import { useState, useEffect, useCallback } from "react";
import { Plus, Target, X, Wallet, Link2, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import GoalsTable from "../components/GoalsTable";
import PredictionGraph from "../components/PredictionGraph";
import AddGoalFromLink from "../components/AddGoalFromLink";
import { getGoals, createGoal, deleteGoal } from "../services/api";

// Average daily saving — could be computed from transaction history later
const AVG_DAILY_SAVING = 75;

export default function Goals() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [totalSavings, setTotalSavings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [addMode, setAddMode] = useState("manual"); // "manual" | "link"
  const [form, setForm] = useState({ name: "", target: "" });
  const [saving, setSaving] = useState(false); // submit spinner

  // Selected goal for prediction graph
  const [selectedGoal, setSelectedGoal] = useState(null);

  // ── Fetch goals from backend ─────────────────────────────
  const fetchGoals = useCallback(async () => {
    try {
      setError("");
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await getGoals();
      const { goals: apiGoals, savingsWallet } = res.data;

      // Normalize backend → frontend field names
      const normalized = apiGoals.map((g) => ({
        id: g._id,
        name: g.itemName,
        target: g.targetPrice,
        image: g.image || null,
        url: g.url || null,
      }));

      setGoals(normalized);
      setTotalSavings(savingsWallet ?? 0);

      if (normalized.length > 0) {
        setSelectedGoal((prev) => prev || normalized[0]);
      }
    } catch (err) {
      console.error("Failed to fetch goals:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      setError(err.response?.data?.message || "Failed to fetch goals. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  // ── Create goal (manual form) ────────────────────────────
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.target) return;

    setSaving(true);
    setError("");

    try {
      const res = await createGoal({
        itemName: form.name,
        targetPrice: Number(form.target),
      });

      const g = res.data.goal;
      const newGoal = {
        id: g._id,
        name: g.itemName,
        target: g.targetPrice,
        image: g.image || null,
        url: g.url || null,
      };

      setGoals((prev) => [...prev, newGoal]);
      setForm({ name: "", target: "" });
      setShowForm(false);
    } catch (err) {
      console.error("Create goal failed:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      setError(err.response?.data?.message || "Failed to create goal. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Create goal from product link ────────────────────────
  const handleAddFromLink = async ({ name, target, image, url }) => {
    setSaving(true);
    setError("");

    try {
      const res = await createGoal({
        itemName: name,
        targetPrice: target,
        image: image || null,
        url: url || null,
      });

      const g = res.data.goal;
      const newGoal = {
        id: g._id,
        name: g.itemName,
        target: g.targetPrice,
        image: g.image || null,
        url: g.url || null,
      };

      setGoals((prev) => [...prev, newGoal]);
      setShowForm(false);
      setAddMode("manual");
    } catch (err) {
      console.error("Create goal from link failed:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      setError(err.response?.data?.message || "Failed to create goal. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete goal ──────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      await deleteGoal(id);
      const remaining = goals.filter((g) => g.id !== id);
      setGoals(remaining);
      if (selectedGoal?.id === id) {
        setSelectedGoal(remaining.length > 0 ? remaining[0] : null);
      }
    } catch (err) {
      console.error("Delete goal failed:", err);
    }
  };

  const handleSelect = (goal) => setSelectedGoal(goal);

  // ── Buy — redirect to product URL or show alert ──────────
  const handleBuy = (goal) => {
    if (goal.url) {
      window.open(goal.url, "_blank", "noopener,noreferrer");
    } else {
      alert(`🎉 Purchasing "${goal.name}" for ₹${goal.target.toLocaleString("en-IN")}!`);
    }
  };

  const readyCount = goals.filter((g) => totalSavings >= g.target).length;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="text-slate-400 text-sm">Loading your goals…</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* ─── Error Banner ───────────────────────────────── */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-300 flex-1">{error}</p>
          <button onClick={() => setError("")} className="text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ─── Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <Target className="w-8 h-8 text-primary" />
            Your Goals
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Items become purchasable when your wallet balance covers their price
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm) setAddMode("manual");
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-emerald-400 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-200 text-sm"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancel" : "Add Goal"}
        </button>
      </div>

      {/* ─── Central Wallet Banner ──────────────────────── */}
      <div className="bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 rounded-2xl p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-indigo-500/15 flex items-center justify-center shrink-0">
          <Wallet className="w-6 h-6 text-indigo-400" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
            Savings Wallet
          </p>
          <p className="text-2xl font-bold text-white font-mono mt-0.5">
            ₹{totalSavings.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="text-right space-y-1">
          <div>
            <p className="text-xs text-slate-500">Avg. daily saving</p>
            <p className="text-sm font-semibold text-emerald-400 font-mono">
              +₹{AVG_DAILY_SAVING}/day
            </p>
          </div>
          {readyCount > 0 && (
            <p className="text-[11px] text-emerald-400 font-semibold">
              {readyCount} item{readyCount !== 1 ? "s" : ""} ready to buy!
            </p>
          )}
        </div>
      </div>

      {/* ─── Add Goal Section ───────────────────────────── */}
      {showForm && (
        <div className="space-y-4">
          {/* Mode Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setAddMode("manual")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                addMode === "manual"
                  ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30"
                  : "bg-slate-800/40 text-slate-500 border border-slate-700/30 hover:text-slate-300"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Manual Entry
            </button>
            <button
              onClick={() => setAddMode("link")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                addMode === "link"
                  ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30"
                  : "bg-slate-800/40 text-slate-500 border border-slate-700/30 hover:text-slate-300"
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              From Product Link
            </button>
          </div>

          {/* Manual Form */}
          {addMode === "manual" && (
            <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700/40 p-6 animate-slideUp">
              <h3 className="text-base font-semibold text-white mb-4">
                What are you saving for?
              </h3>
              <form
                onSubmit={handleAdd}
                className="flex flex-col sm:flex-row gap-4"
              >
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                    Item Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Sneakers, Headphones, Cricket Bat"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm text-white placeholder-slate-500 transition-all"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                    Target Price (₹)
                  </label>
                  <input
                    type="number"
                    value={form.target}
                    onChange={(e) => setForm({ ...form, target: e.target.value })}
                    placeholder="e.g. 3500"
                    min="1"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm text-white placeholder-slate-500 transition-all"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors text-sm disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {saving ? "Creating…" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Link Import */}
          {addMode === "link" && (
            <AddGoalFromLink
              onAddGoal={handleAddFromLink}
              onClose={() => {
                setShowForm(false);
                setAddMode("manual");
              }}
            />
          )}
        </div>
      )}

      {/* ─── Goals Table ────────────────────────────────── */}
      <GoalsTable
        goals={goals}
        totalSavings={totalSavings}
        dailySaving={AVG_DAILY_SAVING}
        onDelete={handleDelete}
        onSelect={handleSelect}
        onBuy={handleBuy}
        selectedGoal={selectedGoal}
      />

      {/* ─── Prediction Graph ───────────────────────────── */}
      <PredictionGraph
        goal={selectedGoal}
        totalSavings={totalSavings}
        dailySaving={AVG_DAILY_SAVING}
      />
    </div>
  );
}
