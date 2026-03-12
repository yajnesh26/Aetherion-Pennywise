import { useState, useEffect } from "react";
import { Clock, ChevronRight, ArrowRight } from "lucide-react";
import GoalCard from "../components/GoalCard";
import PaymentActions from "../components/PaymentActions";
import ContactCard from "../components/ContactCard";
import PaymentModal from "../components/PaymentModal";
import RoundUpPopup from "../components/RoundUpPopup";
import SavingsCard from "../components/SavingsCard";

// ── Dummy data (replace with API later) ───────────────────
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

const dummyGoals = [
  { id: 1, name: "iPhone 16", target: 79900, saved: 32000, dailySaving: 800 },
  { id: 2, name: "Goa Trip", target: 25000, saved: 18500, dailySaving: 400 },
  { id: 3, name: "PS5 Controller", target: 5900, saved: 4200, dailySaving: 150 },
  { id: 4, name: "New Sneakers", target: 8500, saved: 1200, dailySaving: 200 },
];

const dummyTransactions = [
  { id: 1, desc: "Swiggy Order", amount: 287, roundUp: 13, date: "Today" },
  { id: 2, desc: "Uber Ride", amount: 142, roundUp: 8, date: "Today" },
  { id: 3, desc: "Amazon Purchase", amount: 1263, roundUp: 37, date: "Yesterday" },
  { id: 4, desc: "Coffee", amount: 85, roundUp: 15, date: "Yesterday" },
];

export default function Dashboard() {
  const [goals, setGoals] = useState(dummyGoals);
  const [transactions, setTransactions] = useState(dummyTransactions);
  const [totalSavings, setTotalSavings] = useState(8450);
  const [streak] = useState(12);
  const [roundUpsToday, setRoundUpsToday] = useState(2);

  // Payment flow states
  const [paymentModal, setPaymentModal] = useState(null); // contact object or null
  const [roundUpPopup, setRoundUpPopup] = useState(null); // payment object or null

  // Greeting based on time
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const user = JSON.parse(localStorage.getItem("pennywise_user") || "{}");

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

    // Add to transactions
    const newTx = {
      id: Date.now(),
      desc: `${paymentData.contact.name}`,
      amount: paymentData.amount,
      roundUp: Math.ceil(paymentData.amount / 10) * 10 - paymentData.amount,
      date: "Just now",
    };
    setTransactions((prev) => [newTx, ...prev]);

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
          {greeting}, {user.name?.split(" ")[0] || "there"}! 👋
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
