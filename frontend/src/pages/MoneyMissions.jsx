import { useState, useEffect } from "react";
import { 
  Trophy, 
  Target, 
  Flame, 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  Sparkles,
  RefreshCcw,
  Star,
  Zap,
  Clock
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { fetchGoals, fetchTransactions, fetchUserProfile } from "../services/firestore";
import { doc, updateDoc, arrayUnion, increment } from "firebase/firestore";
import { db } from "../services/firebase";

export default function MoneyMissions() {
  const { user } = useAuth();
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profile, goals, transactions] = await Promise.all([
        fetchUserProfile(user.uid),
        fetchGoals(user.uid),
        fetchTransactions(user.uid)
      ]);
      setUserProfile(profile);
      evaluateMissions(profile, goals, transactions);
    } catch (error) {
      console.error("Error loading mission data:", error);
    } finally {
      setLoading(false);
    }
  };

  const evaluateMissions = (profile, goals, transactions) => {
    const generatedMissions = [];
    const completedIds = profile?.completedMissions || [];
    const todayStr = new Date().toLocaleDateString('en-IN');
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // ─── 1. Round-up Mission (Real Check) ───────────
    const todayRoundups = transactions.filter(tx => {
       if (!tx.createdAt) return tx.date?.includes(todayStr.split(',')[0]);
       const txDate = new Date(tx.createdAt.seconds * 1000).toLocaleDateString('en-IN');
       return txDate === todayStr && tx.roundUp > 0;
    });

    generatedMissions.push({
      id: `roundup_${todayStr}`, // Unique for today
      title: "Round-up Streak",
      description: "Complete 3 automated round-up savings today.",
      reward: 5,
      icon: <RefreshCcw className="w-5 h-5 text-indigo-400" />,
      status: todayRoundups.length >= 3 ? "Completed" : "Active",
      progress: todayRoundups.length,
      target: 3,
      claimed: completedIds.includes(`roundup_${todayStr}`)
    });

    // ─── 2. Goal Mission (Real Check) ────────────────
    const activeGoal = goals.find(g => g.saved < g.target);
    if (activeGoal) {
      // Check if any transaction today contributed to this goal
      const contributedToday = transactions.some(tx => {
          if (tx.goalId !== activeGoal.id) return false;
          if (!tx.createdAt) return tx.date?.includes(todayStr.split(',')[0]);
          return new Date(tx.createdAt.seconds * 1000).toLocaleDateString('en-IN') === todayStr;
      });

      generatedMissions.push({
        id: `goal_boost_${activeGoal.id}_${todayStr}`,
        title: "Project Boost",
        description: `Contribute any amount to your "${activeGoal.name}" goal today.`,
        reward: 10,
        icon: <Target className="w-5 h-5 text-emerald-400" />,
        status: contributedToday ? "Completed" : "Active",
        claimed: completedIds.includes(`goal_boost_${activeGoal.id}_${todayStr}`)
      });
    }

    // ─── 3. Category Mission (Real Check) ─────────────
    const hasFoodSpendToday = transactions.some(tx => {
        const desc = tx.desc?.toLowerCase() || "";
        const isFood = desc.includes("swiggy") || desc.includes("zomato") || desc.includes("food");
        if (!isFood) return false;
        if (!tx.createdAt) return tx.date?.includes(todayStr.split(',')[0]);
        return new Date(tx.createdAt.seconds * 1000).toLocaleDateString('en-IN') === todayStr;
    });

    generatedMissions.push({
      id: `discipline_${todayStr}`,
      title: "Dining Discipline",
      description: "Avoid spending on Swiggy/Zomato/Food for a full day.",
      reward: 15,
      icon: <Flame className="w-5 h-5 text-orange-400" />,
      status: hasFoodSpendToday ? "Failed" : "Active", // Resets if you spend
      note: hasFoodSpendToday ? "You spent on food today! Try again tomorrow." : "Keep it up!",
      claimed: completedIds.includes(`discipline_${todayStr}`)
    });

    setMissions(generatedMissions);
  };

  const claimReward = async (mission) => {
    if (!user || mission.status !== "Completed" || mission.claimed) return;
    
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        financialHealthScore: increment(mission.reward),
        completedMissions: arrayUnion(mission.id)
      });
      
      // Update local state
      setMissions(prev => prev.map(m => 
        m.id === mission.id ? { ...m, claimed: true } : m
      ));
      setUserProfile(prev => ({
        ...prev,
        financialHealthScore: (prev.financialHealthScore || 0) + mission.reward
      }));
    } catch (error) {
      console.error("Reward claim error:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-pulse">
        <Zap className="w-12 h-12 text-primary/20 mb-4" />
        <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-sm italic">Scanning Financial Activities...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* ─── Header Section ───────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-[9px] font-black text-primary uppercase tracking-widest">Live Engine v2.1</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter leading-none">Money Missions</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] pl-1">Data-driven behavioral leveling</p>
        </div>
        
        <div className="flex gap-4">
            <div className="bg-slate-900 border border-white/5 rounded-[2rem] px-8 py-5 flex items-center gap-5 shadow-inner">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 flex items-center justify-center border border-emerald-500/20">
                    <Star className="w-7 h-7 text-emerald-400 fill-emerald-400/20" />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Impact Score</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-white tabular-nums">{userProfile?.financialHealthScore || 0}</span>
                        <span className="text-xs font-bold text-emerald-400 opacity-60">XP</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* ─── Mission Tiles ────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {missions.map((mission) => {
            const isCompleted = mission.status === "Completed";
            const isFailed = mission.status === "Failed";
            
            return (
              <div 
                key={mission.id}
                className={`group relative flex flex-col p-8 rounded-[2.5rem] border transition-all duration-500 overflow-hidden ${
                  mission.claimed 
                    ? "bg-slate-900/40 border-slate-800/50 opacity-60" 
                    : isCompleted 
                        ? "bg-emerald-500/5 border-emerald-500/30 shadow-[0_20px_50px_rgba(16,185,129,0.05)]" 
                        : isFailed
                            ? "bg-red-500/5 border-red-500/20 grayscale-[0.5]"
                            : "bg-slate-800/20 border-white/5 hover:border-primary/30 hover:bg-slate-800/40"
                }`}
              >
                {/* Background Pattern */}
                <div className={`absolute -right-4 -bottom-4 w-24 h-24 opacity-5 pointer-events-none transition-transform duration-700 group-hover:scale-125 ${isCompleted ? 'text-emerald-500' : 'text-primary'}`}>
                    {mission.icon}
                </div>

                <div className="flex justify-between items-start mb-10">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                        isCompleted ? "bg-emerald-500 text-slate-900" : "bg-slate-900 text-slate-500 ring-1 ring-white/5"
                    }`}>
                        {mission.icon}
                    </div>
                    {isCompleted && !mission.claimed && <div className="animate-ping absolute top-8 right-8 w-3 h-3 bg-emerald-400 rounded-full" />}
                    {mission.status === "Completed" && <CheckCircle2 className="w-6 h-6 text-emerald-400" />}
                    {mission.status === "Failed" && <X className="w-6 h-6 text-red-500" />}
                </div>

                <div className="flex-1 space-y-3">
                    <h3 className="text-xl font-black text-white tracking-tight">{mission.title}</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">
                        {mission.description}
                    </p>
                    
                    {/* Real Progress Indicator */}
                    {mission.target && !isCompleted && !isFailed && (
                        <div className="space-y-2 pb-4">
                            <div className="flex justify-between text-[9px] font-black text-slate-600 uppercase tracking-widest">
                                <span>Real-time Progress</span>
                                <span>{mission.progress} / {mission.target}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-indigo-500 transition-all duration-1000" 
                                    style={{ width: `${(mission.progress / mission.target) * 100}%` }} 
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <Star className={`w-3.5 h-3.5 ${isCompleted ? 'text-emerald-400' : 'text-slate-600'}`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isCompleted ? 'text-emerald-400' : 'text-slate-500'}`}>
                            +{mission.reward} Impact
                        </span>
                    </div>

                    {isCompleted && !mission.claimed ? (
                        <button 
                            onClick={(e) => { e.stopPropagation(); claimReward(mission); }}
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-black px-4 py-2 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-2"
                        >
                            Claim <ArrowRight className="w-3 h-3" />
                        </button>
                    ) : (
                        <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                            <Clock className="w-3 h-3" /> 
                            {mission.claimed ? "Completed" : isFailed ? "Resets Daily" : "Tracking..."}
                        </div>
                    )}
                </div>
              </div>
            );
        })}
      </div>

      {/* ─── Footer Details ───────────────────────────── */}
      <div className="bg-slate-900/50 backdrop-blur rounded-[2rem] p-10 border border-white/5 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
          <div className="w-20 h-20 rounded-3xl bg-slate-800 flex items-center justify-center shrink-0">
             <Trophy className="w-10 h-10 text-slate-600" />
          </div>
          <div>
              <h4 className="text-xl font-black text-white mb-2">How missions are calculated</h4>
              <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-2xl">
                  Our AI engine scans your transaction patterns and goals in real-time. Missions are updated daily at midnight. 
                  Completing them builds your **Impact Score**, which influences your eligibility for high-tier financial insights.
              </p>
          </div>
          <button 
            onClick={loadData}
            className="md:ml-auto px-8 py-4 bg-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all border border-white/5 shrink-0"
          >
            Force Sync Board
          </button>
      </div>
    </div>
  );
}
