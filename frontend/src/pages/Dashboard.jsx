import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Sparkles, Loader2 } from "lucide-react";
import PaymentActions from "../components/PaymentActions";
import ContactCard from "../components/ContactCard";
import PaymentModal from "../components/PaymentModal";
import RoundUpPopup from "../components/RoundUpPopup";
import PriorityGoalCard from "../components/PriorityGoalCard";
import TransactionList from "../components/TransactionList";
import { getGoals, makePayment } from "../services/api";

// ── Static contacts (could be fetched from backend later) ──
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
  const navigate = useNavigate();

  // Data from backend
  const [goals, setGoals] = useState([]);
  const [totalSavings, setTotalSavings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [txRefreshKey, setTxRefreshKey] = useState(0); // bump to re-fetch transactions

  // Payment flow states
  const [paymentModal, setPaymentModal] = useState(null);
  const [roundUpPopup, setRoundUpPopup] = useState(null);
  const [roundUpInfo, setRoundUpInfo] = useState(null);

  // Greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const user = JSON.parse(localStorage.getItem("pennywise_user") || "{}");

  // ── Fetch goals + wallet from backend ────────────────────
  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await getGoals();
      const { goals: apiGoals, savingsWallet } = res.data;

      const normalized = apiGoals.map((g) => ({
        id: g._id,
        name: g.itemName,
        target: g.targetPrice,
        image: g.image || null,
        url: g.url || null,
      }));

      setGoals(normalized);
      setTotalSavings(savingsWallet ?? 0);
    } catch (err) {
      console.error("Dashboard fetch failed:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Payment flow handlers ────────────────────────────────
  const handleContactPay = (contact) => setPaymentModal(contact);

  const handleActionClick = (actionLabel) => {
    if (actionLabel === "Pay Contacts" || actionLabel === "Send Money") {
      setPaymentModal({ name: "Enter Details", upi: "" });
    } else {
      setPaymentModal({
        name: actionLabel,
        upi: `${actionLabel.toLowerCase().replace(" ", "")}@upi`,
      });
    }
  };

  const handlePaymentComplete = async (paymentData) => {
    setPaymentModal(null);

    try {
      const res = await makePayment({
        amount: paymentData.amount,
        description: paymentData.contact?.name || "Payment",
      });

      const { roundUpSaved, savingsWallet } = res.data;

      // Update wallet balance
      setTotalSavings(savingsWallet);

      // Store round-up info for popup
      setRoundUpInfo({
        savedAmount: roundUpSaved,
        walletBalance: savingsWallet,
      });

      // Show round-up popup
      setRoundUpPopup(paymentData);

      // Trigger transaction list refresh
      setTxRefreshKey((k) => k + 1);
    } catch (err) {
      console.error("Payment failed:", err);
    }
  };

  const handleRoundUpSave = () => setRoundUpPopup(null);
  const handleRoundUpSkip = () => setRoundUpPopup(null);

  // ── Loading state ────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

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

      {/* ─── Savings Wallet Banner ──────────────────────── */}
      <section>
        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">
              Savings Wallet:{" "}
              <span className="text-emerald-400">₹{totalSavings.toFixed(0)}</span>
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

      {/* ─── 3. Active Priority Goal ───────────────────── */}
      <section>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Goal Progress
        </h2>
        <PriorityGoalCard goals={goals} totalSavings={totalSavings} />
      </section>

      {/* ─── 4. Recent Transactions (live from backend) ─── */}
      <section>
        <TransactionList key={txRefreshKey} limit={8} compact />
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
          roundUpInfo={roundUpInfo}
          onSave={handleRoundUpSave}
          onSkip={handleRoundUpSkip}
        />
      )}
    </div>
  );
}
