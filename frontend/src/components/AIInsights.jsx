import { useState, useEffect } from "react";
import { Sparkles, Activity, AlertCircle } from "lucide-react";
import { getCoachingInsights } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export default function AIInsights() {
  const { user } = useAuth();
  const [coaching, setCoaching] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getCoachingInsights(user.uid)
      .then(setCoaching)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="bg-slate-800/40 backdrop-blur border border-slate-700/50 rounded-3xl p-6 h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Consulting Coach...</p>
        </div>
      </div>
    );
  }

  const score = coaching?.score || 0;
  const scoreColor = score > 80 ? "text-emerald-400" : score > 50 ? "text-amber-400" : "text-red-400";
  const scoreBg = score > 80 ? "bg-emerald-500/10" : score > 50 ? "bg-amber-500/10" : "bg-red-500/10";

  return (
    <div className="bg-slate-800/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 h-full flex flex-col relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Financial Coach</h2>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] font-bold text-slate-300">Analyzing live data</span>
          </div>
        </div>
        <div className="relative flex items-center justify-center">
            <svg className="w-12 h-12 transform -rotate-90">
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-slate-800" />
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="transparent" 
                    strokeDasharray={2 * Math.PI * 20} 
                    strokeDashoffset={2 * Math.PI * 20 * (1 - score / 100)} 
                    className={`${scoreColor} transition-all duration-1000`} 
                />
            </svg>
            <span className={`absolute text-[10px] font-black ${scoreColor}`}>{score}</span>
        </div>
      </div>

      <div className="space-y-6 flex-1 relative z-10">
        {/* Advice Section */}
        <div className="relative">
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                    <Sparkles className="w-4 h-4 text-slate-900" />
                </div>
                <div className="bg-slate-900/80 backdrop-blur rounded-2xl rounded-tl-none p-4 border border-white/5 shadow-xl">
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                        {coaching?.advice || "Your financial health is looking solid. Keep at it!"}
                    </p>
                </div>
            </div>
        </div>

        {/* Dynamic Highlight */}
        {coaching?.insights?.length > 0 && (
            <div className="flex flex-col gap-3">
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest pl-1">Key Observations</p>
                <div className="grid grid-cols-1 gap-2">
                    {coaching.insights.slice(0, 2).map((insight, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                            <div className={`w-1.5 h-1.5 rounded-full ${insight.includes("%") ? 'bg-amber-400' : 'bg-primary'}`} />
                            <p className="text-[10px] text-slate-400 font-bold leading-tight">{insight}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
      
      <div className="mt-8 flex items-center justify-between opacity-50 relative z-10">
         <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">PennyWise AI v2.0</span>
         <div className="flex gap-1.5">
            {[1,2,3,4].map(i => <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === 1 ? 'w-4 bg-primary' : 'w-1 bg-slate-700'}`} />)}
         </div>
      </div>
    </div>
  );
}
