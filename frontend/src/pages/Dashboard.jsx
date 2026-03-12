import { useState, useEffect } from "react";
import { Clock, ChevronRight, ArrowRight } from "lucide-react";
import GoalCard from "../components/GoalCard";
import PaymentActions from "../components/PaymentActions";
import ContactCard from "../components/ContactCard";
import PaymentModal from "../components/PaymentModal";
import RoundUpPopup from "../components/RoundUpPopup";
import SavingsCard from "../components/SavingsCard";
import { useAuth } from "../contexts/AuthContext";
import { fetchGoals } from "../services/firestore";
import { fetchTransactions, addTransaction } from "../services/firestore";

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
  const [streak] = useState(0);
  const [roundUpsToday, setRoundUpsToday] = useState(0);

  useEffect(() => {
    if (!user) return;
    fetchGoals(user.uid).then(setGoals).catch(console.error);
    fetchTransactions(user.uid).then((txs) => {
      setTransactions(txs);
      setTotalSavings(txs.reduce((s, t) => s + (t.roundUp || 0), 0));
    }).catch(console.error);
  }, [user]);

  // Payment flow states
  const [paymentModal, setPaymentModal] = useState(null); // contact object or null
  const [roundUpPopup, setRoundUpPopup] = useState(null); // payment object or null

  // Greeting based on time
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const displayName = user?.displayName || "there";

  // ── Payment flow handlers ──────────────────────────────

  const handleContactPay = (contact) => {
    setPaymentModal(contact);
  };

  const handleActionClick = (actionLabel) => {
    // For "Pay Contacts", show a generic contact modal
    if (actionLabel === "Pay Contacts" || actionLabel === "Send Money") {
      setPaymentModal({ name: "Enter Details", upi: "" });
    } else {
      // For other actions, show a generic payment modal
      setPaymentModal({ name: actionLabel, upi: `${actionLabel.toLowerCase().replace(" ", "")}@upi` });
    }
  };

  const handlePaymentComplete = (paymentData) => {
    setPaymentModal(null);

    // Add to Firestore and local state
    const txData = {
      desc: `${paymentData.contact.name}`,
      amount: paymentData.amount,
      roundUp: Math.ceil(paymentData.amount / 10) * 10 - paymentData.amount,
      date: "Just now",
    };
    addTransaction(user.uid, txData)
      .then((saved) => setTransactions((prev) => [saved, ...prev]))
      .catch(console.error);

    // Show round-up popup
    setRoundUpPopup(paymentData);
  };

  const handleRoundUpSave = (saveData) => {
    setTotalSavings((prev) => prev + saveData.amount);
    setRoundUpsToday((prev) => prev + 1);
    setRoundUpPopup(null);
  };

  const handleRoundUpSkip = () => {
    setRoundUpPopup(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 space-y-6">
      {/* ─── Header ─────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          {greeting}, {displayName.split(" ")[0]}! 👋
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          Pay anyone, save automatically
        </p>
      </div>

      {/* ─── 1. Quick Payment Actions ───────────────────── */}
      <section>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Quick Actions
        </h2>
        <PaymentActions onAction={handleActionClick} />
      </section>

      {/* ─── 2. Recent Contacts ─────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Recent People
          </h2>
          <button className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors">
            View all <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
          {dummyContacts.map((contact, i) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              index={i}
              onPay={handleContactPay}
            />
          ))}
        </div>
      </section>

      {/* ─── 3. Savings Overview ────────────────────────── */}
      <section>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Your Savings
        </h2>
        <SavingsCard
          totalSavings={totalSavings}
          activeGoals={goals.length}
          streak={streak}
          roundUpsToday={roundUpsToday}
        />
      </section>

      {/* ─── 4. Goals + Transactions Grid ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Goals */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Goal Progress
            </h2>
            <a
              href="/goals"
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
            >
              Manage <ArrowRight className="w-3 h-3" />
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>

        {/* Recent Round-Up Transactions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Recent Round-Ups
            </h2>
            <Clock className="w-4 h-4 text-slate-600" />
          </div>
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700/40 divide-y divide-slate-700/20">
            {transactions.slice(0, 6).map((tx) => (
              <div
                key={tx.id}
                className="px-4 py-3.5 flex items-center justify-between hover:bg-slate-800/40 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-slate-200">{tx.desc}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{tx.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400 font-mono">₹{tx.amount}</p>
                  {tx.roundUp > 0 && (
                    <p className="text-xs font-semibold text-emerald-400">
                      +₹{tx.roundUp} saved
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Modals / Popups ────────────────────────────── */}
      {paymentModal && (
        <PaymentModal
          contact={paymentModal}
          onClose={() => setPaymentModal(null)}
          onPayment={handlePaymentComplete}
        />
      )}

      {roundUpPopup && (
        <RoundUpPopup
          payment={roundUpPopup}
          onSave={handleRoundUpSave}
          onSkip={handleRoundUpSkip}
        />
      )}
    </div>
  );
}
