import { useEffect, useState } from 'react';
import BillingCard from '../components/BillingCard';
import api from '../services/api';

export default function Billing() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleUpgrade = async (plan) => {
    try {
      const res = await api.post('/billing/create-checkout', { plan });
      if (res.data.url) {
        // Mock redirect logic
        window.location.href = res.data.url;
      }
    } catch (err) {
      console.error(err);
      alert('Failed to initiate upgrade');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  const currentPlan = stats?.currentPlan || 'free';
  const used = stats?.totalRequestsUsed || 0;
  const limit = stats?.requestLimit || 100;
  const percent = limit === -1 ? 0 : Math.min(100, Math.round((used / limit) * 100));

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      <h1 className="text-3xl font-bold text-white mb-8">Billing & Usage</h1>

      <div className="glass-panel p-8 rounded-3xl border border-slate-800 mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <h2 className="text-xl font-bold text-white mb-6">Current Period Usage</h2>
        
        <div className="mb-4 flex justify-between items-end">
          <div>
            <span className="text-4xl font-extrabold text-white">{used.toLocaleString()}</span>
            <span className="text-slate-400 ml-2">requests used</span>
          </div>
          <div className="text-right text-slate-400">
            {limit === -1 ? 'Unlimited requests' : `${limit.toLocaleString()} limit`}
          </div>
        </div>

        {limit !== -1 && (
          <div className="w-full bg-slate-800 rounded-full h-3 mb-2 overflow-hidden">
            <div 
              className={`h-3 rounded-full transition-all duration-1000 ${percent > 90 ? 'bg-rose-500' : 'bg-primary'}`} 
              style={{ width: `${percent}%` }}
            ></div>
          </div>
        )}
        
        {percent > 90 && limit !== -1 && (
          <p className="text-sm text-rose-400 mt-2 font-medium">You are approaching your plan limit. Upgrade to avoid interruptions.</p>
        )}
      </div>

      <h2 className="text-2xl font-bold text-white mb-6">Subscription Plans</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BillingCard 
          title="Free" 
          price="0" 
          features={['100 requests / month', 'Basic Support', '1 API Endpoint']} 
          isCurrent={currentPlan === 'free'}
          onUpgrade={() => handleUpgrade('free')}
        />
        <BillingCard 
          title="Pro" 
          price="29" 
          features={['10,000 requests / month', 'Priority Support', 'Unlimited Endpoints', 'Detailed Analytics']} 
          isCurrent={currentPlan === 'pro'}
          onUpgrade={() => handleUpgrade('pro')}
          highlight={true}
        />
        <BillingCard 
          title="Enterprise" 
          price="99" 
          features={['Unlimited requests', '24/7 Dedicated Support', 'Custom Domains', 'SLA Guarantee']} 
          isCurrent={currentPlan === 'enterprise'}
          onUpgrade={() => handleUpgrade('enterprise')}
        />
      </div>
    </div>
  );
}
