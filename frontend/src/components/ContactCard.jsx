import { User } from "lucide-react";

const avatarColors = [
  "from-emerald-500 to-teal-400",
  "from-violet-500 to-purple-400",
  "from-sky-500 to-cyan-400",
  "from-amber-500 to-orange-400",
  "from-rose-500 to-pink-400",
  "from-indigo-500 to-blue-400",
  "from-lime-500 to-green-400",
  "from-fuchsia-500 to-pink-400",
];

export default function ContactCard({ contact, index = 0, onPay }) {
  const gradient = avatarColors[index % avatarColors.length];

  return (
    <button
      onClick={() => onPay?.(contact)}
      className="group flex flex-col items-center gap-2 min-w-[76px] p-3 rounded-2xl hover:bg-slate-800/60 transition-all duration-200 active:scale-95"
    >
      {/* Avatar */}
      {contact.avatar ? (
        <img
          src={contact.avatar}
          alt={contact.name}
          className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-700/60 group-hover:ring-slate-600 transition-all"
        />
      ) : (
        <div
          className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center ring-2 ring-white/10 group-hover:ring-white/20 transition-all shadow-lg`}
        >
          <span className="text-sm font-bold text-white select-none">
            {contact.name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </span>
        </div>
      )}

      {/* Name */}
      <span className="text-[11px] font-medium text-slate-400 group-hover:text-slate-200 transition-colors text-center leading-tight truncate w-full">
        {contact.name}
      </span>
    </button>
  );
}
