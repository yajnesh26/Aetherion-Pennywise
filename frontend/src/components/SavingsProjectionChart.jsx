import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 backdrop-blur border border-slate-700 p-2 rounded-lg shadow-xl">
        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Day {label}</p>
        <p className="text-sm font-bold text-emerald-400">₹{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function SavingsProjectionChart({ data, target }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="h-32 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis 
            dataKey="day" 
            hide 
          />
          <YAxis 
            domain={[0, target * 1.1]} 
            hide 
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="savings" 
            stroke="#10b981" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorSavings)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
