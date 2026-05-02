import { useEffect, useState } from 'react';
import { Activity, Globe, Zap, CreditCard } from 'lucide-react';
import UsageChart from '../components/UsageChart';
import api from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, chartRes, logsRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/chart'),
          api.get('/dashboard/logs?limit=5')
        ]);
        setStats(statsRes.data);
        setChartData(chartRes.data);
        setLogs(logsRes.data.logs);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
        <div className="bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700/50 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-sm font-medium text-slate-300">Gateway Active</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Requests" value={stats?.totalRequestsUsed || 0} icon={Activity} color="text-indigo-400" bg="bg-indigo-400/10" />
        <StatCard title="Requests Today" value={stats?.requestsToday || 0} icon={Zap} color="text-emerald-400" bg="bg-emerald-400/10" />
        <StatCard title="Active APIs" value={stats?.activeApis || 0} icon={Globe} color="text-sky-400" bg="bg-sky-400/10" />
        <StatCard 
          title="Current Plan" 
          value={stats?.currentPlan.charAt(0).toUpperCase() + stats?.currentPlan.slice(1) || 'Free'} 
          icon={CreditCard} 
          color="text-amber-400" 
          bg="bg-amber-400/10" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800">
          <h2 className="text-xl font-bold text-white mb-6">Usage Over Time</h2>
          <UsageChart data={chartData} />
        </div>

        {/* Recent Logs */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Recent Requests</h2>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {logs.length > 0 ? logs.map(log => (
              <div key={log.id} className="bg-slate-800/30 p-4 rounded-xl border border-slate-800/50">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-slate-200">{log.endpoint}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${log.status < 400 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{log.status}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-slate-400">
                  <span className="font-mono bg-slate-800 px-1.5 rounded">{log.method} {log.path}</span>
                  <span>{log.responseTime}ms</span>
                </div>
              </div>
            )) : (
              <p className="text-slate-500 text-center mt-10">No recent requests</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg }) {
  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center gap-4 hover:border-slate-700 transition-colors">
      <div className={`p-4 rounded-xl ${bg}`}>
        <Icon size={24} className={color} />
      </div>
      <div>
        <h3 className="text-sm font-medium text-slate-400">{title}</h3>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
      </div>
    </div>
  );
}
