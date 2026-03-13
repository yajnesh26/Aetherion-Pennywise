import { useState, useEffect } from "react";
import { Clock, ChevronRight, ArrowRight, PiggyBank, Target, Flame, TrendingUp, Activity, Sparkles, CreditCard } from "lucide-react";
import PaymentActions from "../components/PaymentActions";
import ContactCard from "../components/ContactCard";
import PaymentModal from "../components/PaymentModal";
import RoundUpPopup from "../components/RoundUpPopup";
import AIInsights from "../components/AIInsights";
import QRScannerModal from "../components/QRScannerModal";
import { useAuth } from "../contexts/AuthContext";
import { 
  fetchGoals, 
  fetchUserProfile, 
  updateUserBalances, 
  fetchTransactions, 
  addTransaction,
  allocateSavingToGoal,
  updateTransactionWithGoal
} from "../services/firestore";
import { calculateDailySavingRate } from "../utils/savingsUtils";

const dummyContacts = [
  { id: 1, name: "Rahul S.", upi: "rahul@upi" },
  { id: 2, name: "Swiggy", upi: "swiggy@paytm" },
  { id: 3, name: "Amazon", upi: "amazon@apl" },
  { id: 4, name: "Priya M.", upi: "priya@upi" },
  { id: 5, name: "Electricity", upi: "bescom@bbps" },
  { id: 6, name: "Netflix", upi: "netflix@rzp" },
  { id: 7, name: "Aman K.", upi: "aman@upi" },
  { id: 8, name: "Zomato", upi: "zomato@paytm" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [totalSavings, setTotalSavings] = useState(0);
  const [bankBalance, setBankBalance] = useState(0);
  const [streak] = useState(0);
  const [savingRate, setSavingRate] = useState(0);
  const [paymentModal, setPaymentModal] = useState(null);
  const [roundUpPopup, setRoundUpPopup] = useState(null);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchUserProfile(user.uid).then((profile) => {
      if (profile) {
        setBankBalance(Number(profile.bankBalance) || 0);
        setTotalSavings(Number(profile.walletSavings) || 0);
      }
    });
    fetchGoals(user.uid).then(setGoals);
    fetchTransactions(user.uid).then(txs => {
      setTransactions(txs);
      setSavingRate(calculateDailySavingRate(txs));
    });
  }, [user]);

  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening";

  const handleContactPay = (contact) => setPaymentModal(contact);
  const handleActionClick = (label) => {
    if (label === "Scan QR") {
      setQrScannerOpen(true);
      return;
    }
    if (label === "Pay Contacts" || label === "Send Money" || label === "Enter Details") {
      setPaymentModal({ name: "Details", upi: "" });
    } else {
      setPaymentModal({ name: label, upi: `${label.toLowerCase().replace(/\s+/g, '')}@upi` });
    }
  };

  const handleQRScan = (data) => {
    setQrScannerOpen(false);
    // basic parsing of upi://pay?pa=...&pn=...
    try {
      const url = new URL(data);
      const pa = url.searchParams.get("pa");
      const pn = url.searchParams.get("pn") || "QR Recipient";
      if (pa) {
        setPaymentModal({ name: pn, upi: pa });
      } else {
        setPaymentModal({ name: "QR Recipient", upi: data });
      }
    } catch (e) {
      setPaymentModal({ name: "QR Recipient", upi: data });
    }
  };

  const handlePaymentComplete = (data) => {
    const roundUp = Math.ceil(data.amount / 10) * 10 - data.amount;
    const total = data.amount + roundUp;
    if (total > bankBalance) return alert("Insufficient funds!");
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) + ', ' + 
                          now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    const txData = { 
      desc: data.contact.name, 
      amount: data.amount, 
      roundUp, 
      date: formattedDate 
    };

    updateUserBalances(user.uid, -total, roundUp).then(() => {
      setBankBalance(p => p - total);
      setTotalSavings(p => p + roundUp);
    });

    addTransaction(user.uid, txData).then((saved) => {
      setTransactions(p => [saved, ...p]);
      setRoundUpPopup({ ...data, transactionId: saved.id });
    });
  };

  const handleRoundUpSave = ({ amount, goalId, transactionId }) => {
    if (goalId && amount > 0) {
      allocateSavingToGoal(goalId, amount).then(() => fetchGoals(user.uid).then(setGoals));
      if (transactionId) updateTransactionWithGoal(transactionId, goalId).then(() => fetchTransactions(user.uid).then(setTransactions));
    }
    setRoundUpPopup(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 space-y-6">
      {/* ─── Header ─────────────────────────────────────── */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">Financial Intelligence</p>
          <h1 className="text-3xl font-black text-white tracking-tighter">{greeting}, {user?.displayName?.split(" ")[0]}!</h1>
        </div>
        <div className="hidden md:flex gap-3">
          <div className="px-4 py-2 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-2">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-[10px] font-black text-slate-400 uppercase">{streak} Day Streak</span>
          </div>
        </div>
      </div>

      {/* ─── Bento Grid (Collage) ────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Wallet Card - Sleek & Horizontal */}
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl shadow-indigo-500/20">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-indigo-200 text-[10px] font-black uppercase tracking-[0.3em] mb-2 font-mono">Total Liquid Balance</p>
                <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold opacity-40">₹</span>
                    <h2 className="text-5xl font-black tracking-tighter tabular-nums">{bankBalance.toLocaleString()}</h2>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur shadow-inner">
                 <CreditCard className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="mt-12 flex gap-8 border-t border-white/10 pt-6">
              <div>
                <p className="text-indigo-300 text-[9px] font-black uppercase tracking-widest mb-1">Total Savings</p>
                <p className="text-xl font-black text-white">₹{totalSavings.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-indigo-300 text-[9px] font-black uppercase tracking-widest mb-1">Goals Active</p>
                <p className="text-xl font-black text-white">{goals.filter(g => g.saved < g.target).length} <span className="text-xs opacity-50">/ {goals.length}</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Specialist - The "Brain" of the Collage */}
        <div className="lg:col-span-2 lg:row-span-2 h-full">
           <AIInsights key={transactions.length + totalSavings} />
        </div>

        {/* Quick Actions - Bento Tile */}
        <div className="lg:col-span-2 bg-slate-800/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-7 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-6 ml-2">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Action Hub</h3>
            </div>
            <PaymentActions onAction={handleActionClick} />
        </div>
      </div>

      {/* ─── Lower Section Grid ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Transaction History (Wide) */}
        <div className="lg:col-span-2 bg-slate-800/20 backdrop-blur border border-white/5 rounded-[2.5rem] p-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-6">
                    <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Activity Stream</h3>
                    <div className="px-3 py-1 bg-primary/10 rounded-full text-[9px] font-black text-primary uppercase">Real-time</div>
                </div>
                <button className="text-[10px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest">Clear Analytics</button>
            </div>
            <div className="space-y-2">
                {transactions.slice(0, 5).map((tx) => {
                    const getIcon = (desc) => {
                        const d = desc.toLowerCase();
                        if (d.includes('swiggy') || d.includes('zomato')) return <div className="w-11 h-11 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center"><Flame className="w-5 h-5"/></div>;
                        if (d.includes('amazon') || d.includes('shop')) return <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center"><Target className="w-5 h-5"/></div>;
                        if (d.includes('bill') || d.includes('recharge')) return <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center"><Activity className="w-5 h-5"/></div>;
                        return <div className="w-11 h-11 rounded-2xl bg-slate-900 text-slate-500 flex items-center justify-center"><Clock className="w-5 h-5"/></div>;
                    };
                    return (
                        <div key={tx.id} className="group flex items-center justify-between p-4 rounded-[1.5rem] hover:bg-white/[0.03] transition-all border border-transparent hover:border-white/5">
                            <div className="flex items-center gap-4">
                                {getIcon(tx.desc)}
                                <div>
                                    <p className="text-sm font-black text-slate-100 group-hover:text-primary transition-colors">{tx.desc}</p>
                                    <p className="text-[10px] text-slate-500 font-black uppercase mt-0.5 tracking-tighter">{tx.date}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-white font-mono tabular-nums tracking-tighter">₹{Number(tx.amount).toLocaleString()}</p>
                                {tx.roundUp > 0 && <p className="text-[10px] font-black text-emerald-400 uppercase mt-1 italic tracking-widest">Saved ₹{tx.roundUp}</p>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Goals & Contacts Stack (The Collage Finish) */}
        <div className="flex flex-col gap-6">
            <div className="bg-slate-800/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-7">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-5">Quick Pay</h3>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {dummyContacts.slice(0, 5).map((contact) => (
                        <button key={contact.id} onClick={() => handleContactPay(contact)} className="shrink-0 flex flex-col items-center gap-3 group">
                            <div className="w-14 h-14 rounded-full border-2 border-slate-700 p-1 group-hover:border-primary transition-all">
                                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-xs font-black text-slate-400 group-hover:bg-primary group-hover:text-slate-900 transition-all font-mono">
                                    {contact.name.split(' ').map(n=>n[0]).join('')}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur border border-white/5 rounded-[2.5rem] p-7 flex-1">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Goals</h3>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="space-y-6">
                    {goals.filter(g => g.saved < g.target).slice(0, 2).map(goal => {
                        const pct = Math.min(Math.round((goal.saved / goal.target) * 100), 100);
                        return (
                            <div key={goal.id}>
                                <div className="flex justify-between items-end mb-2.5">
                                    <span className="text-[11px] font-black text-slate-300">{goal.name}</span>
                                    <span className="text-[10px] font-black text-emerald-400 font-mono tracking-tighter">{pct}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5">
                                    <div className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all duration-1000" style={{ width: `${pct}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
                <a href="/goals" className="mt-8 flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5">
                    View Project Board <ArrowRight className="w-3.5 h-3.5" />
                </a>
            </div>
        </div>
      </div>

      {paymentModal && <PaymentModal contact={paymentModal} onClose={() => setPaymentModal(null)} onPayment={handlePaymentComplete} balance={bankBalance} />}
      {roundUpPopup && <RoundUpPopup payment={roundUpPopup} goals={goals} onSave={handleRoundUpSave} onSkip={() => setRoundUpPopup(null)} />}
      {qrScannerOpen && <QRScannerModal onClose={() => setQrScannerOpen(false)} onScan={handleQRScan} />}
    </div>
  );
}
