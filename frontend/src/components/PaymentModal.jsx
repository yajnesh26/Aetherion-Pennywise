import { useState } from "react";
import { X, IndianRupee, ArrowRight } from "lucide-react";

const avatarColors = [
  "from-emerald-500 to-teal-400",
  "from-violet-500 to-purple-400",
  "from-sky-500 to-cyan-400",
  "from-amber-500 to-orange-400",
];

export default function PaymentModal({ contact, onClose, onPayment }) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(contact?.phone || "");
  const [processing, setProcessing] = useState(false);

  const handlePay = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;

    // Validate phone number (10 digits)
    const cleaned = String(phoneNumber || "").replace(/\D/g, "");
    if (!/^\d{10}$/.test(cleaned)) {
      // simple inline alert — keep UI consistent with modal style
      alert("Please enter a valid 10-digit phone number");
      return;
    }

    setProcessing(true);
    // Simulate payment processing
    await new Promise((r) => setTimeout(r, 1200));
    setProcessing(false);

    onPayment?.({ phoneNumber: cleaned, contact, amount: numAmount, description: note });
  };

  const quickAmounts = [100, 200, 500, 1000, 2000, 5000];
  const initials = contact?.name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "??";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/60 rounded-t-3xl sm:rounded-3xl p-6 animate-slideUp shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Contact info */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg avatar-glow animate-float">
            <span className="text-sm font-bold text-white">{initials}</span>
          </div>
          <div>
            <p className="text-white font-semibold">{contact?.name}</p>
            <p className="text-slate-400 text-sm">{contact?.upi || "UPI Payment"}</p>
          </div>
        </div>

        {/* Amount input */}
        <div className="relative mb-4">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <IndianRupee className="w-5 h-5 text-emerald-400" />
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            autoFocus
            className="w-full pl-12 pr-4 py-4 bg-slate-800/80 border border-slate-700/60 rounded-2xl text-white text-3xl font-bold placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        {/* Phone number input */}
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Phone number (10 digits)"
          className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700/40 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/30 transition-all mb-4"
        />

        {/* Quick amount chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {quickAmounts.map((qa) => (
            <button
              key={qa}
              onClick={() => setAmount(String(qa))}
              className={`tag ${amount === String(qa) ? 'tag-emerald' : 'tag-muted'} transition-all duration-150`}
            >
              ₹{qa.toLocaleString()}
            </button>
          ))}
        </div>

        {/* Note input */}
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note (optional)"
          className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700/40 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/30 transition-all mb-5"
        />

        {/* Pay button */}
        <button
          onClick={handlePay}
          disabled={!amount || parseFloat(amount) <= 0 || processing}
          className="w-full py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-[0.98]"
        >
          {processing ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Pay ₹{amount ? parseFloat(amount).toLocaleString() : "0"}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
