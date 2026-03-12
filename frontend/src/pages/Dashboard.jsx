import { useState } from "react";
import { Clock, ChevronRight, Sparkles } from "lucide-react";
import PaymentActions from "../components/PaymentActions";
import ContactCard from "../components/ContactCard";
import PaymentModal from "../components/PaymentModal";
import RoundUpPopup from "../components/RoundUpPopup";
import PriorityGoalCard from "../components/PriorityGoalCard";

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

const dummyTransactions = [
  { id: 1, desc: "Swiggy Order", amount: 287, roundUp: 13, date: "Today" },
  { id: 2, desc: "Uber Ride", amount: 142, roundUp: 8, date: "Today" },
  { id: 3, desc: "Amazon Purchase", amount: 1263, roundUp: 37, date: "Yesterday" },
  { id: 4, desc: "Coffee", amount: 85, roundUp: 15, date: "Yesterday" },
];

// Goal data (mirrors Goals page — replace with shared state/API later)
const dashboardGoals = [
  {
    id: 1,
    name: "Nike Air Max 90",
    target: 3500,
    image: "https://m.media-amazon.com/images/I/71GZNHP+XAL._AC_SL1500_.jpg",
    url: "https://www.amazon.in/dp/B0EXAMPLE1",
  },
  {
    id: 2,
    name: "Sony WH-1000XM5 Headphones",
    target: 2500,
    image: "https://m.media-amazon.com/images/I/51aXvjzcukL._AC_SL1500_.jpg",
    url: "https://www.amazon.in/dp/B0EXAMPLE2",
  },
  {
    id: 3,
    name: "SG English Willow Cricket Bat",
    target: 1800,
    image: "https://m.media-amazon.com/images/I/41WjQoL5lNL._AC_SL1200_.jpg",
    url: "https://www.amazon.in/dp/B0EXAMPLE3",
  },
  {
    id: 4,
    name: "Goa Trip",
    target: 12000,
  },
  {
    id: 5,
    name: "PS5 DualSense Controller",
    target: 5900,
    image: "https://m.media-amazon.com/images/I/61lsPklJzAL._AC_SL1500_.jpg",
    url: "https://www.amazon.in/dp/B0EXAMPLE5",
  },
];
const TOTAL_SAVINGS = 2800;

export default function Dashboard() {
  const [transactions, setTransactions] = useState(dummyTransactions);

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
    if (actionLabel === "Pay Contacts" || actionLabel === "Send Money") {
      setPaymentModal({ name: "Enter Details", upi: "" });
    } else {
      setPaymentModal({ name: actionLabel, upi: `${actionLabel.toLowerCase().replace(" ", "")}@upi` });
    }
  };

  const handlePaymentComplete = (paymentData) => {
    setPaymentModal(null);

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

  const handleRoundUpSave = () => {
    setRoundUpPopup(null);
  };

  const handleRoundUpSkip = () => {
    setRoundUpPopup(null);
  };

  // Total round-ups saved today
  const todayRoundUps = transactions
    .filter((tx) => tx.date === "Today" || tx.date === "Just now")
    .reduce((sum, tx) => sum + tx.roundUp, 0);

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

      {/* ─── 3. Round-Up Savings Suggestion ─────────────── */}
      {todayRoundUps > 0 && (
        <section>
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">
                Round-up savings today: <span className="text-emerald-400">₹{todayRoundUps}</span>
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Every transaction rounds up to the nearest ₹10 — small change, big goals!
              </p>
            </div>
            <a
              href="/goals"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 whitespace-nowrap transition-colors"
            >
              View Goals →
            </a>
          </div>
        </section>
      )}

      {/* ─── 4. Active Priority Goal ───────────────────── */}
      <section>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Goal Progress
        </h2>
        <PriorityGoalCard goals={dashboardGoals} totalSavings={TOTAL_SAVINGS} />
      </section>

      {/* ─── 5. Recent Transactions ─────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Recent Transactions
          </h2>
          <Clock className="w-4 h-4 text-slate-600" />
        </div>
        <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700/40 divide-y divide-slate-700/20">
          {transactions.slice(0, 8).map((tx) => (
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
      </section>

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
