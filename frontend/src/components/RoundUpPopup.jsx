import { useState } from "react";
import { CheckCircle2, PiggyBank, ArrowUp, X, Sparkles, Target } from "lucide-react";

export default function RoundUpPopup({ payment, goals, onSave, onSkip }) {
  const [saved, setSaved] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState("");

  const original = payment?.amount || 0;
  const roundedUp = Math.ceil(original / 10) * 10;
  const spare = roundedUp - original;

  // If there's no spare change (exact multiple of 10), show a small auto-save suggestion
  const hasSavings = spare > 0;
  const suggestedSave = hasSavings ? spare : 10;

  const activeGoals = goals?.filter(g => (g.saved || 0) < (g.target || 0)) || [];

  const handleSave = () => {
    if (!selectedGoalId && activeGoals.length > 0) {
      alert("Please select a goal to save to!");
      return;
    }
    
    setSaved(true);
    setTimeout(() => {
      onSave?.({ 
        amount: suggestedSave, 
        goalId: selectedGoalId || (activeGoals[0]?.id),
        transactionId: payment?.transactionId 
      });
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center animate-fadeIn px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Popup */}
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700/60 rounded-t-3xl sm:rounded-3xl p-6 animate-slideUp shadow-2xl">
        {/* Skip/Close button */}
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Success icon */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
        </div>

        {/* Payment success text */}
        <div className="text-center mb-6">
          <h3 className="text-lg font-bold text-white mb-1">Success!</h3>
          <p className="text-slate-400 text-xs">
            ₹{original.toLocaleString()} paid to{" "}
            <span className="text-slate-200 font-medium">{payment?.contact?.name || "merchant"}</span>
          </p>
        </div>

        {/* Round-up card */}
        <div className="bg-slate-800/60 border border-slate-700/40 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Savings Opportunity</span>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Spare Change</span>
              <span className="text-2xl font-bold text-white font-mono">₹{suggestedSave}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <PiggyBank className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Select Goal</label>
              {activeGoals.length > 0 ? (
                <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto scrollbar-hide">
                    {activeGoals.map(goal => (
                        <button
                            key={goal.id}
                            onClick={() => setSelectedGoalId(goal.id)}
                            className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                                selectedGoalId === goal.id 
                                ? "bg-emerald-500/10 border-emerald-500/50" 
                                : "bg-slate-900/40 border-slate-700/30 hover:border-slate-600"
                            }`}
                        >
                            <div className="flex items-center gap-2 overflow-hidden">
                                <Target className={`w-3.5 h-3.5 ${selectedGoalId === goal.id ? "text-emerald-400" : "text-slate-500"}`} />
                                <span className={`text-xs truncate ${selectedGoalId === goal.id ? "text-white font-bold" : "text-slate-400"}`}>{goal.name}</span>
                            </div>
                            {selectedGoalId === goal.id && <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />}
                        </button>
                    ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic px-1">No active goals. Create one to start saving!</p>
              )}
          </div>
        </div>

        {/* Action buttons */}
        {!saved ? (
          <div className="flex gap-3">
            <button
              onClick={onSkip}
              className="flex-1 py-3.5 rounded-xl text-xs font-bold text-slate-500 bg-slate-800/40 border border-slate-700/30 hover:bg-slate-800 hover:text-slate-300 transition-all active:scale-[0.97]"
            >
              Skip
            </button>
            <button
              onClick={handleSave}
              disabled={activeGoals.length === 0}
              className="flex-[1.5] py-3.5 rounded-xl text-xs font-black uppercase tracking-widest text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.97] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              Confirm ₹{suggestedSave}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-2 text-emerald-400 animate-fadeIn">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight text-center">Added to {activeGoals.find(g => g.id === selectedGoalId)?.name || 'goal'}! 🎯</span>
          </div>
        )}
      </div>
    </div>
  );
}
