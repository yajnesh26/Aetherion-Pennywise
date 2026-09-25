import { useState, useEffect, useCallback, useId, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Sparkles, Loader2, AlertCircle, X } from "lucide-react";
import PaymentActions from "../components/PaymentActions";
import ContactCard from "../components/ContactCard";
import PaymentModal from "../components/PaymentModal";
import RoundUpPopup from "../components/RoundUpPopup";
import PriorityGoalCard from "../components/PriorityGoalCard";
import TransactionList from "../components/TransactionList";
import { getGoals, makePayment } from "../services/api";
import QRScanner from "../components/QRScanner";
import { parseUPIQR } from "../utils/parseUpiQR";
import useFocusTrap from "../hooks/useFocusTrap";

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
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanError, setScanError] = useState("");
  const [allContactsOpen, setAllContactsOpen] = useState(false);
  const allContactsDialogRef = useRef(null);
  const allContactsTitleId = useId();

  // Keeps focus inside the "All Contacts" modal and closes it on Escape.
  useFocusTrap(allContactsDialogRef, {
    onEscape: () => setAllContactsOpen(false),
    active: allContactsOpen,
  });

  // Greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const user = JSON.parse(localStorage.getItem("pennywise_user") || "{}");

  // If profile incomplete, force setup before accessing dashboard
  useEffect(() => {
    if (!user || !user.phoneNumber || !user.accountNumber) {
      navigate("/setup-profile");
    }
  }, [navigate, user]);

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

  const handleAllContactsPay = (contact) => {
    setAllContactsOpen(false);
    handleContactPay(contact);
  };

  const handleActionClick = (actionLabel) => {

    // OPEN QR SCANNER
    if (actionLabel === "Scan QR") {
      setScanError("");
      setScannerOpen(true);
      return;
    }

    if (actionLabel === "Pay Contacts" || actionLabel === "Send Money") {
      setPaymentModal({ name: "Enter Details", upi: "" });
    } else {
      setPaymentModal({
        name: actionLabel,
        upi: `${actionLabel.toLowerCase().replace(" ", "")}@upi`,
      });
    }
  };

  const handleQRScan = (data) => {
    setScannerOpen(false);
    setScanError("");

    const parsed = parseUPIQR(data);

    if (!parsed) {
      setScanError("This doesn't appear to be a UPI QR code. Please scan a genuine UPI payment QR and try again.");
      return;
    }

    setPaymentModal({
      name: parsed.name,
      upi: parsed.upi,
    });
  };

  const handlePaymentComplete = async (paymentData) => {
    try {
      const res = await makePayment({
        phoneNumber: paymentData.phoneNumber,
        amount: paymentData.amount,
        description: paymentData.description || paymentData.contact?.name || "Payment",
      });

      const { transaction, savingsWallet } = res.data;

      // Update wallet balance
      setTotalSavings(savingsWallet);

      // Store round-up info for popup (backend-driven)
      setRoundUpInfo({
        savedAmount: transaction.savedAmount,
        walletBalance: savingsWallet,
      });

      // Show round-up popup (pass payment details so popup can mention recipient)
      setRoundUpPopup(paymentData);

      // Trigger transaction list refresh
      setTxRefreshKey((k) => k + 1);

      // Payment succeeded — only now close the modal
      setPaymentModal(null);

      return { success: true };
    } catch (err) {
      console.error("Payment failed:", err);

      // Keep the modal open and surface a user-facing message (no raw errors)
      const error =
        err.response?.data?.message ||
        (err.response
          ? "Payment could not be completed. Please try again."
          : "Network error. Please check your connection and try again.");

      return { success: false, error };
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
      {/* ─── QR Scan Error Banner ───────────────────────── */}
      {scanError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-300 flex-1">{scanError}</p>
          <button
            onClick={() => setScanError("")}
            className="text-red-400 hover:text-red-300 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
          <button
            onClick={() => setAllContactsOpen(true)}
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
          >
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
      {scannerOpen && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setScannerOpen(false)}
        />
      )}

      {allContactsOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fadeIn">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setAllContactsOpen(false)}
          />
          <div
            ref={allContactsDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={allContactsTitleId}
            tabIndex={-1}
            className="relative w-full max-w-md bg-slate-900 border border-slate-700/60 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto"
          >
            <button
              onClick={() => setAllContactsOpen(false)}
              aria-label="Close all contacts"
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 id={allContactsTitleId} className="text-white font-semibold">All Contacts</h3>
            <p className="text-slate-400 text-sm mb-6">
              {dummyContacts.length} contacts
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {dummyContacts.map((contact, i) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  index={i}
                  onPay={handleAllContactsPay}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
