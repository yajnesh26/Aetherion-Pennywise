import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { TrendingUp } from "lucide-react";

/**
 * Generate projection data for the central wallet toward a single goal.
 *
 * @param {number} totalSavings  — current wallet balance
 * @param {number} target        — active goal's target price
 * @param {number} dailySaving   — avg daily saving rate
 */
function generateProjection(totalSavings, target, dailySaving) {
  const avgDaily = dailySaving || 50;
  const remaining = Math.max(target - totalSavings, 0);
  const totalDays = remaining <= 0 ? 0 : Math.ceil(remaining / avgDaily);
  const points = [];
  const step = Math.max(Math.floor(totalDays / 15), 1);

  for (let day = 0; day <= totalDays; day += step) {
    points.push({
      day: `Day ${day}`,
      dayNum: day,
      savings: Math.min(totalSavings + avgDaily * day, target),
      target: target,
    });
  }
  // Ensure final point
  if (points.length === 0 || points[points.length - 1].dayNum !== totalDays) {
    points.push({
      day: totalDays === 0 ? "Today" : `Day ${totalDays}`,
      dayNum: totalDays,
      savings: target,
      target: target,
    });
  }
  return { points, totalDays };
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700/60 rounded-xl px-4 py-3 shadow-xl text-xs">
      <p className="font-semibold text-slate-300 mb-1.5">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-slate-400">{entry.name}:</span>
          <span className="font-semibold text-white">
            ₹{entry.value.toLocaleString("en-IN")}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * PredictionGraph — projects central wallet growth toward any selected goal.
 *
 * Props:
 *  - goal          : { name, target }  — the selected goal
 *  - totalSavings  : number  — central wallet balance
 *  - dailySaving   : number  — avg daily saving rate
 */
export default function PredictionGraph({ goal, totalSavings = 0, dailySaving = 50 }) {
  if (!goal) {
    return (
      <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700/40 p-8 text-center shadow-xl shadow-black/10">
        <TrendingUp className="w-10 h-10 text-slate-700 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-slate-400 mb-1">
          Savings Prediction
        </h3>
        <p className="text-xs text-slate-500">
          Select a goal from the table to see your projected savings growth
        </p>
      </div>
    );
  }

  const { points: data, totalDays: daysLeft } = generateProjection(
    totalSavings,
    goal.target,
    dailySaving
  );
  const percentage = Math.min((totalSavings / goal.target) * 100, 100);
  const isReady = totalSavings >= goal.target;

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700/40 p-5 sm:p-6 shadow-xl shadow-black/10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4.5 h-4.5 text-emerald-400" />
            Wallet Growth Projection
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Toward{" "}
            <span className="text-slate-300 font-medium">{goal.name}</span>
            {" — "}
            <span className="text-slate-400">₹{goal.target.toLocaleString("en-IN")}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Current progress chip */}
          <div className="bg-slate-700/40 rounded-lg px-3 py-1.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-slate-300">
              {percentage.toFixed(0)}% funded
            </span>
          </div>
          {/* Prediction chip */}
          {isReady ? (
            <div className="bg-emerald-500/10 ring-1 ring-emerald-500/20 rounded-lg px-3 py-1.5">
              <span className="text-xs text-emerald-400 font-semibold">
                🎉 Ready to purchase!
              </span>
            </div>
          ) : (
            <div className="bg-emerald-500/10 ring-1 ring-emerald-500/20 rounded-lg px-3 py-1.5">
              <span className="text-xs text-emerald-400 font-semibold">
                ~{daysLeft} days left
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#334155"
              strokeOpacity={0.5}
              vertical={false}
            />

            <XAxis
              dataKey="day"
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={{ stroke: "#334155" }}
              tickLine={false}
              interval="preserveStartEnd"
            />

            <YAxis
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) =>
                v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`
              }
              width={55}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Target line */}
            <ReferenceLine
              y={goal.target}
              stroke="#f59e0b"
              strokeDasharray="6 4"
              strokeWidth={1.5}
              label={{
                value: `Goal: ₹${goal.target.toLocaleString("en-IN")}`,
                position: "right",
                fill: "#f59e0b",
                fontSize: 11,
                fontWeight: 600,
              }}
            />

            {/* Current wallet line */}
            <ReferenceLine
              y={totalSavings}
              stroke="#6366f1"
              strokeDasharray="4 4"
              strokeWidth={1}
              label={{
                value: `Wallet: ₹${totalSavings.toLocaleString("en-IN")}`,
                position: "left",
                fill: "#818cf8",
                fontSize: 10,
              }}
            />

            {/* Projected savings area + line */}
            <Area
              type="monotone"
              dataKey="savings"
              stroke="#10b981"
              strokeWidth={2.5}
              fill="url(#savingsGradient)"
              dot={false}
              activeDot={{
                r: 5,
                fill: "#10b981",
                stroke: "#0f172a",
                strokeWidth: 2,
              }}
              name="Projected Savings"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-5 mt-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 rounded bg-emerald-400" />
          <span>Projected Growth</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 rounded bg-indigo-400 opacity-70" style={{ borderTop: "1px dashed" }} />
          <span>Current Wallet</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 rounded bg-amber-400 opacity-70" style={{ borderTop: "1px dashed" }} />
          <span>Goal Target</span>
        </div>
      </div>
    </div>
  );
}
