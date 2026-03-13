import { useState } from "react";
import { X, IndianRupee, ArrowRight } from "lucide-react";

const avatarColors = [
  "from-emerald-500 to-teal-400",
  "from-violet-500 to-purple-400",
  "from-sky-500 to-cyan-400",
  "from-amber-500 to-orange-400",
];

export default function PaymentModal({ contact, onClose, onPayment, balance = 0 }) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [manualName, setManualName] = useState("");
  const [manualUpi, setManualUpi] = useState("");
  const [processing, setProcessing] = useState(false);

  const isManual = contact?.name === "Enter Details" || contact?.name === "Details" || !contact?.upi;

  const handlePay = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;

    if (isManual && (!manualName || !manualUpi)) {
      alert("Please enter recipient name and UPI ID.");
      return;
    }

    const roundUp = Math.ceil(numAmount / 10) * 10 - numAmount;
    if (numAmount + roundUp > balance) {
      alert("Insufficient funds in your account.");
      return;
    }

    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1200));
    setProcessing(false);

    onPayment?.({ 
      contact: isManual ? { name: manualName, upi: manualUpi } : contact, 
      amount: numAmount, 
      note 
    });
  };

  const quickAmounts = [100, 200, 500, 1000, 2000, 5000];
  const initials = isManual 
    ? (manualName ? manualName.slice(0, 2).toUpperCase() : "??")
    : (contact?.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "??");

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

        {/* Contact info or input fields */}
        {isManual ? (
          <div className="space-y-3 mb-6">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Recipient Name</label>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700/40 rounded-xl text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">UPI ID or Phone Number</label>
              <input
                type="text"
                placeholder="username@upi or 9876543210"
                value={manualUpi}
                onChange={(e) => setManualUpi(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700/40 rounded-xl text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium"
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg">
              <span className="text-sm font-bold text-white">{initials}</span>
            </div>
            <div>
              <p className="text-white font-semibold">{isManual ? (manualName || "New Recipient") : contact?.name}</p>
              <div className="flex items-center gap-2">
                <p className="text-slate-400 text-xs">{isManual ? (manualUpi || "Enter UPI ID") : (contact?.upi || "UPI Payment")}</p>
                <div className="w-1 h-1 bg-slate-700 rounded-full" />
                <p className="text-emerald-400/80 text-xs font-medium">Balance: ₹{balance.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

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

        {/* Quick amount chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {quickAmounts.map((qa) => (
            <button
              key={qa}
              onClick={() => setAmount(String(qa))}
              className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                amount === String(qa)
                  ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40"
                  : "bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
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
