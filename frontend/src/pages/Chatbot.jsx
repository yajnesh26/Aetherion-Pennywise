import { useState, useRef, useEffect } from "react";
import { Send, Bot, Sparkles } from "lucide-react";
import ChatMessage from "../components/ChatMessage";
// import { sendChatMessage } from "../services/api";

const aiResponses = {
  default:
    "That's a great question! Based on your spending patterns, I'd suggest setting up automatic round-ups on all transactions and creating small daily savings goals. Even ₹50/day adds up to ₹18,250 in a year!",
  save: "Here are some proven ways to save money faster:\n\n1. **Round-up every transaction** — PennyWise does this automatically!\n2. **Set specific goals** — Visual progress bars keep you motivated.\n3. **Cut subscriptions** you don't use.\n4. **Follow the 50/30/20 rule** — 50% needs, 30% wants, 20% savings.\n5. **Cook more at home** — You could save ₹3000-5000/month!",
  invest:
    "For ₹500, here are smart micro-investment options:\n\n1. **SIP in Index Funds** — Start a monthly SIP in Nifty 50 index funds.\n2. **Digital Gold** — Buy small amounts of gold starting from ₹1.\n3. **Liquid Funds** — Better than savings accounts, easy to withdraw.\n4. **Government Bonds** — Safe and steady returns via RBI Retail Direct.\n\nStart small and stay consistent — that's the key!",
  budget:
    "Let me help you create a budget! Based on your recent transactions:\n\n• **Food & Dining**: ₹4,200 (consider reducing by 20%)\n• **Transport**: ₹1,800 (try carpooling!)\n• **Shopping**: ₹3,500 (set a monthly limit)\n• **Subscriptions**: ₹899 (audit these quarterly)\n\nYour potential monthly savings: ₹2,100 more!",
};

function getAIResponse(message) {
  const lower = message.toLowerCase();
  if (lower.includes("save") || lower.includes("saving"))
    return aiResponses.save;
  if (lower.includes("invest") || lower.includes("₹"))
    return aiResponses.invest;
  if (lower.includes("budget") || lower.includes("spend"))
    return aiResponses.budget;
  return aiResponses.default;
}

const suggestions = [
  "How can I save money faster?",
  "Where should I invest ₹500?",
  "Help me create a budget",
  "What are round-up savings?",
];

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      text: "Hi! I'm your PennyWise AI assistant 🤖\n\nI can help you with savings tips, investment advice, and budgeting strategies. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg) return;

    const newUserMsg = { id: Date.now(), role: "user", text: userMsg };
    setMessages((prev) => [...prev, newUserMsg]);
    setInput("");
    setTyping(true);

    // Simulate AI delay
    setTimeout(() => {
      // Uncomment when backend is ready:
      // const res = await sendChatMessage({ message: userMsg });
      const aiText = getAIResponse(userMsg);

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", text: aiText },
      ]);
      setTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col" style={{ height: "calc(100vh - 4rem)" }}>
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-indigo-400 flex items-center justify-center shadow-md shadow-indigo-500/20">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">AI Assistant</h1>
          <p className="text-xs text-slate-500">
            Powered by PennyWise Intelligence
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-xs text-slate-500">Online</span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-slate-800/60 backdrop-blur rounded-2xl border border-slate-700/50 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {/* Typing indicator */}
          {typing && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-slate-700/50 border border-slate-600/30 rounded-2xl rounded-tl-md px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="px-4 sm:px-6 pb-3 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent bg-indigo-500/10 rounded-full hover:bg-indigo-500/20 border border-indigo-500/20 transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-slate-700/50 px-4 sm:px-6 py-4 flex gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about saving & investing..."
            className="flex-1 px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-600/50 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none text-sm text-white placeholder-slate-500 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || typing}
            className="px-4 py-3 bg-gradient-to-r from-accent to-indigo-400 text-white rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-200 disabled:opacity-40 disabled:shadow-none"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
