import { useState, useEffect } from "react";
import {
  History,
  TrendingUp,
  Search,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { fetchTransactions } from "../services/firestore";

export default function Transaction() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchTransactions(user.uid)
      .then((data) => {
        setHistory(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [user]);

  const totalSaved = history.reduce((acc, tx) => acc + (tx.roundUp || 0), 0);
  
  const filteredHistory = history.filter(tx => 
    tx.desc?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ─── Header ─────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <History className="w-8 h-8 text-primary" />
            Activity Log
          </h1>
          <p className="text-slate-400 mt-1">
            Track every payment and witness your savings grow effortlessly
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-slate-900/50 rounded-2xl px-6 py-3 border border-slate-700/30 text-right">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">Total Spare Saved</p>
            <p className="text-xl font-bold text-primary flex items-center justify-end gap-2">
              <TrendingUp className="w-4 h-4" />
              ₹{totalSaved.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* ─── Filters & Search ───────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800/40 border border-slate-700/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm text-white placeholder-slate-500 transition-all"
          />
        </div>
        <button className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all text-sm font-medium">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* ─── History Table ──────────────────────────────── */}
      <div className="bg-slate-800/40 backdrop-blur rounded-3xl border border-slate-700/50 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/80 text-[10px] uppercase tracking-widest font-bold text-slate-500 border-b border-slate-700/30">
                <th className="px-6 py-4">Transaction Details</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Payment</th>
                <th className="px-6 py-4 text-right">Saved (Goal)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center">
                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 text-sm">Fetching your activity...</p>
                  </td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center">
                    <History className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-400 font-semibold text-lg">No transactions found</p>
                    <p className="text-slate-500 text-sm mt-1">When you make a payment, it will show up here!</p>
                  </td>
                </tr>
              ) : (
                filteredHistory.map((tx) => (
                  <tr key={tx.id} className="group hover:bg-slate-700/20 transition-all duration-200">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-700/50 group-hover:border-primary/40 transition-colors">
                          <ArrowUpRight className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-white font-semibold group-hover:text-primary transition-colors">
                            {tx.desc}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">{tx.date}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Completed
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right font-medium text-white">
                      ₹{tx.amount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-primary font-bold">
                          +₹{tx.roundUp || 0}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                          Boosted
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
