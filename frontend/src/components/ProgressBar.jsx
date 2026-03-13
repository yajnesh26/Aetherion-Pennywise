export default function ProgressBar({ current, target, progress }) {
  // If progress is provided directly, use it. Otherwise calculate from current/target.
  let percentage = 0;
  if (progress !== undefined) {
    percentage = progress;
  } else if (target > 0) {
    percentage = Math.min((current / target) * 100, 100);
  }

  return (
    <div className="w-full">
      {/* Only show header if current and target are provided and not overlapping with GoalCard */}
      {current !== undefined && target !== undefined && (
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>₹{(current || 0).toLocaleString("en-IN")}</span>
          <span>₹{(target || 0).toLocaleString("en-IN")}</span>
        </div>
      )}
      <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${percentage}%`,
            background:
              percentage >= 100
                ? "linear-gradient(90deg, #10b981, #059669)"
                : percentage >= 50
                ? "linear-gradient(90deg, #10b981, #34d399)"
                : "linear-gradient(90deg, #6366f1, #818cf8)",
          }}
        />
      </div>
      {/* Optional: Show percentage text if current/target were not provided (meaning it's a standalone bar) */}
      {current === undefined && (
         <p className="text-[10px] text-slate-500 mt-1 text-right font-medium">
           {Math.round(percentage)}% complete
         </p>
      )}
    </div>
  );
}
