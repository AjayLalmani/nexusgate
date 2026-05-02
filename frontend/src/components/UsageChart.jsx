import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function UsageChart({ data }) {
  if (!data || data.length === 0) return <div className="h-64 flex items-center justify-center text-slate-500">No data available</div>;

  return (
    <div className="h-72 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#64748b" 
            fontSize={12} 
            tickFormatter={(val) => {
              const d = new Date(val);
              return `${d.getMonth()+1}/${d.getDate()}`;
            }} 
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            stroke="#64748b" 
            fontSize={12} 
            axisLine={false}
            tickLine={false}
            tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
            itemStyle={{ color: '#818cf8' }}
            labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
          />
          <Line 
            type="monotone" 
            dataKey="requests" 
            stroke="#6366f1" 
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: '#4f46e5', stroke: '#0f172a', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
