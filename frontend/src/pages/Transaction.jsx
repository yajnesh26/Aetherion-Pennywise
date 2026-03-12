import { useState, useEffect } from "react";
import {
  ArrowLeftRight,
  Calculator,
  PiggyBank,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { fetchTransactions, addTransaction } from "../services/firestore";

export default function Transaction() {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!user) return;
    fetchTransactions(user.uid).then(setHistory).catch(console.error);
  }, [user]);

  const calculateRoundUp = () => {
    if (!amount || Number(amount) <= 0) return;

    const original = Number(amount);
    const rounded = Math.ceil(original / 10) * 10;
    const savedAmount = rounded - original;

    setResult({ original, rounded, saved: savedAmount === 0 ? 10 : savedAmount });
    setSaved(false);
  };

  const handleAddToSavings = async () => {
    if (!result) return;
    setSaved(true);

    const txData = {
      original: result.original,
      rounded: result.rounded,
      roundUp: result.saved,
      desc: "Round-up",
      amount: result.original,
      date: "Just now",
    };

    try {
      const savedTx = await addTransaction(user.uid, txData);
      setHistory([savedTx, ...history]);
    } catch (err) {
      console.error(err);
    }
  };

  const totalSaved = history.reduce((acc, tx) => acc + (tx.roundUp || tx.saved || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
          <ArrowLeftRight className="w-8 h-8 text-primary" />
          Round-Up Savings
        </h1>
        <p className="text-slate-400 mt-1">
          Every purchase rounds up — small savings that add up big
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Calculator Card */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800/60 backdrop-blur rounded-2xl border border-slate-700/50 p-6 sticky top-24">
            <div className="flex items-center gap-2 mb-6">
              <Calculator className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-semibold text-white">
                Round-Up Calculator
              </h2>
            </div>

            {/* Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Transaction Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                  ₹
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setResult(null);
                    setSaved(false);
                  }}
                  placeholder="87"
                  min="1"
                  className="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm text-white placeholder-slate-500 transition-all"
                  onKeyDown={(e) => e.key === "Enter" && calculateRoundUp()}
                />
              </div>
            </div>

            <button
              onClick={calculateRoundUp}
              className="w-full py-3 px-4 bg-gradient-to-r from-accent to-indigo-400 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              Calculate Round-Up
            </button>

            {/* Result */}
            {result && (
              <div className="mt-6 space-y-4">
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                  <div className="flex items-center justify-center gap-4 text-lg">
                    <span className="text-slate-400">₹{result.original}</span>
                    <ArrowRight className="w-5 h-5 text-primary" />
                    <span className="font-bold text-white">
                      ₹{result.rounded}
                    </span>
                  </div>
                  <div className="text-center mt-2">
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary bg-emerald-500/10 px-3 py-1 rounded-full">
                      <PiggyBank className="w-4 h-4" />
                      Saved ₹{result.saved}
                    </span>
                  </div>
                </div>

                {!saved ? (
                  <button
                    onClick={handleAddToSavings}
                    className="w-full py-3 px-4 bg-gradient-to-r from-primary to-emerald-400 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                  >
                    <PiggyBank className="w-4 h-4" />
                    Add to Savings
                  </button>
                ) : (
                  <div className="flex items-center justify-center gap-2 py-3 text-primary font-semibold">
                    <CheckCircle2 className="w-5 h-5" />
                    Added to your savings!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* History */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              Round-Up History
            </h2>
            <span className="text-sm font-semibold text-primary bg-emerald-500/10 px-3 py-1 rounded-full">
              Total: ₹{totalSaved}
            </span>
          </div>
          <div className="bg-slate-800/60 backdrop-blur rounded-2xl border border-slate-700/50 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-4 gap-4 px-5 py-3 bg-slate-800/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>Original</span>
              <span>Rounded</span>
              <span>Saved</span>
              <span>When</span>
            </div>
            {/* Rows */}
            <div className="divide-y divide-slate-700/30">
              {history.map((tx) => (
                <div
                  key={tx.id}
                  className="grid grid-cols-4 gap-4 px-5 py-4 text-sm hover:bg-slate-700/20 transition-colors"
                >
                  <span className="text-slate-400">₹{tx.original}</span>
                  <span className="text-white font-medium">
                    ₹{tx.rounded}
                  </span>
                  <span className="text-primary font-semibold">
                    +₹{tx.roundUp || tx.saved || 0}
                  </span>
                  <span className="text-slate-500">{tx.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
