import {
  Users,
  ScanLine,
  Smartphone,
  Receipt,
  Briefcase,
  SendHorizontal,
} from "lucide-react";

const actions = [
  { icon: Users, label: "Pay Contacts", iconColor: "text-emerald-400", bg: "bg-emerald-500/10", ring: "ring-emerald-500/20" },
  { icon: ScanLine, label: "Scan QR", iconColor: "text-violet-400", bg: "bg-violet-500/10", ring: "ring-violet-500/20" },
  { icon: Smartphone, label: "Recharge", iconColor: "text-sky-400", bg: "bg-sky-500/10", ring: "ring-sky-500/20" },
  { icon: Receipt, label: "Bill Payment", iconColor: "text-amber-400", bg: "bg-amber-500/10", ring: "ring-amber-500/20" },
  { icon: Briefcase, label: "Business Pay", iconColor: "text-rose-400", bg: "bg-rose-500/10", ring: "ring-rose-500/20" },
  { icon: SendHorizontal, label: "Send Money", iconColor: "text-indigo-400", bg: "bg-indigo-500/10", ring: "ring-indigo-500/20" },
];

export default function PaymentActions({ onAction }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            onClick={() => onAction?.(action.label)}
            className="group flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/40 hover:border-slate-600/60 hover:bg-slate-800/80 transition-all duration-200 hover:scale-[1.04] active:scale-[0.97]"
          >
            <div className={`w-12 h-12 rounded-xl ${action.bg} ring-1 ${action.ring} flex items-center justify-center transition-transform duration-200 group-hover:scale-110`}>
              <Icon className={`w-5 h-5 ${action.iconColor}`} />
            </div>
            <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors text-center leading-tight">
              {action.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
