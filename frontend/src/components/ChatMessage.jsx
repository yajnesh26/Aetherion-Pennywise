import { Bot, User } from "lucide-react";

export default function ChatMessage({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isUser
            ? "bg-indigo-500/15 text-accent"
            : "bg-emerald-500/15 text-primary"
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message bubble */}
      <div
        className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-accent text-white rounded-tr-md"
            : "bg-slate-700/50 text-slate-200 border border-slate-600/30 rounded-tl-md"
        }`}
      >
        {message.text}
      </div>
    </div>
  );
}
