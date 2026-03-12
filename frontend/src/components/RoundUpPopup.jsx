import { useState } from "react";
import { CheckCircle2, PiggyBank, ArrowUp, X, Sparkles } from "lucide-react";

export default function RoundUpPopup({ payment, onSave, onSkip }) {
  const [saved, setSaved] = useState(false);

  const original = payment?.amount || 0;
  const roundedUp = Math.ceil(original / 10) * 10;
  const spare = roundedUp - original;

  // If there's no spare change (exact multiple of 10), show a small auto-save suggestion
  const hasSavings = spare > 0;
  const suggestedSave = hasSavings ? spare : 10;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      onSave?.({ amount: suggestedSave, original, roundedUp });
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center animate-fadeIn">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

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
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
        </div>

        {/* Payment success text */}
        <div className="text-center mb-5">
          <h3 className="text-lg font-bold text-white mb-1">Payment Successful!</h3>
          <p className="text-slate-400 text-sm">
            ₹{original.toLocaleString()} paid to{" "}
            <span className="text-slate-200">{payment?.contact?.name || "merchant"}</span>
          </p>
        </div>

        {/* Round-up card */}
        <div className="bg-slate-800/60 border border-slate-700/40 rounded-2xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-amber-400">Smart Round-Up</span>
          </div>

          {hasSavings ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">You paid</span>
                <span className="text-slate-200 font-mono">₹{original}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Rounded to</span>
                <span className="text-slate-200 font-mono">₹{roundedUp}</span>
              </div>
              <div className="border-t border-dashed border-slate-700 my-2" />
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 font-semibold text-sm">Spare change</span>
                <span className="text-emerald-400 font-bold text-lg font-mono">₹{spare}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-1">
              <p className="text-slate-400 text-sm mb-1">
                Your payment was an exact amount.
              </p>
              <p className="text-slate-300 text-sm">
                Save a quick <span className="text-emerald-400 font-bold">₹{suggestedSave}</span> to your goals?
              </p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        {!saved ? (
          <div className="flex gap-3">
            <button
              onClick={onSkip}
              className="flex-1 py-3 rounded-xl text-sm font-medium text-slate-400 bg-slate-800/60 border border-slate-700/40 hover:bg-slate-800 hover:text-slate-200 transition-all active:scale-[0.97]"
            >
              Skip
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.97] flex items-center justify-center gap-1.5"
            >
              <PiggyBank className="w-4 h-4" />
              Save ₹{suggestedSave}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 py-3 text-emerald-400 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-semibold">Saved to your goals!</span>
          </div>
        )}
      </div>
    </div>
  );
}
