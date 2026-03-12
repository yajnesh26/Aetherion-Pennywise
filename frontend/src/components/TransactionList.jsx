import { useState, useEffect } from "react";
import {
  ArrowUpRight,
  Clock,
  PiggyBank,
  Loader2,
  Receipt,
} from "lucide-react";
import { getTransactions } from "../services/api";

/**
 * TransactionList — fetches and displays the user's transaction history
 * from the backend with round-up savings info.
 *
 * Props (optional):
 *  - limit  : number — max transactions to show (default: all)
 *  - compact: boolean — smaller cards for dashboard embed
 */
export default function TransactionList({ limit, compact = false }) {
  const [transactions, setTransactions] = useState([]);
  const [totalSaved, setTotalSaved] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTxns = async () => {
      try {
        const res = await getTransactions();
        setTransactions(res.data.transactions || []);
        setTotalSaved(res.data.totalRoundUpSaved || 0);
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTxns();
  }, []);

  const displayed = limit ? transactions.slice(0, limit) : transactions;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (displayed.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700/40 p-8 text-center">
        <Receipt className="w-10 h-10 text-slate-700 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-slate-400 mb-1">
          No transactions yet
        </h3>
        <p className="text-xs text-slate-500">
          Make a payment to start saving with round-ups!
        </p>
      </div>
    );
  }

  // Format date nicely
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (hours < 48) return "Yesterday";
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="space-y-3">
      {/* Summary bar (only in full mode) */}
      {!compact && (
        <div className="flex items-center justify-between px-1 mb-1">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <span className="text-xs text-slate-500">
              {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <PiggyBank className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400">
              Total saved: ₹{totalSaved.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      )}

      <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700/40 divide-y divide-slate-700/20 overflow-hidden">
        {displayed.map((tx) => (
          <div
            key={tx._id}
            className="px-4 py-3.5 flex items-center justify-between hover:bg-slate-800/40 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Icon */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  tx.savedAmount > 0
                    ? "bg-emerald-500/10"
                    : "bg-slate-700/40"
                }`}
              >
                <ArrowUpRight
                  className={`w-4 h-4 ${
                    tx.savedAmount > 0
                      ? "text-emerald-400"
                      : "text-slate-500"
                  }`}
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">
                  {tx.description}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {formatDate(tx.createdAt)}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0 ml-3">
              <p className="text-sm text-slate-300 font-mono">
                ₹{tx.originalAmount.toLocaleString("en-IN")}
                {tx.savedAmount > 0 && (
                  <span className="text-slate-600 mx-1">→</span>
                )}
                {tx.savedAmount > 0 && (
                  <span className="text-slate-500">
                    ₹{tx.roundedAmount.toLocaleString("en-IN")}
                  </span>
                )}
              </p>
              {tx.savedAmount > 0 && (
                <p className="text-xs font-semibold text-emerald-400 mt-0.5">
                  +₹{tx.savedAmount} saved
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
