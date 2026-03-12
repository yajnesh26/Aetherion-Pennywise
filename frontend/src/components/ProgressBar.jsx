export default function ProgressBar({ current, target }) {
  const percentage = Math.min((current / target) * 100, 100);

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span>₹{current.toLocaleString("en-IN")}</span>
        <span>₹{target.toLocaleString("en-IN")}</span>
      </div>
      <div className="w-full h-3 bg-slate-700/50 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            background:
              percentage >= 80
                ? "linear-gradient(90deg, #10b981, #059669)"
                : percentage >= 50
                ? "linear-gradient(90deg, #10b981, #34d399)"
                : "linear-gradient(90deg, #6366f1, #818cf8)",
          }}
        />
      </div>
      <p className="text-xs text-slate-500 mt-1 text-right">
        {percentage.toFixed(0)}% complete
      </p>
    </div>
  );
}
