import { useAuthStore } from '../store/authStore';

export default function Settings() {
  const { user } = useAuthStore();

  return (
    <div className="p-8 max-w-3xl mx-auto animate-in fade-in duration-300">
      <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

      <div className="space-y-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h2 className="text-xl font-bold text-white mb-4">Profile Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Name</label>
              <input type="text" value={user?.name || ''} readOnly className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-300 cursor-not-allowed focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
              <input type="email" value={user?.email || ''} readOnly className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-300 cursor-not-allowed focus:outline-none" />
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-rose-500/30 bg-rose-500/5 relative overflow-hidden">
          <h2 className="text-xl font-bold text-rose-400 mb-2">Danger Zone</h2>
          <p className="text-slate-400 text-sm mb-6">Once you delete your account, there is no going back. Please be certain.</p>
          <button className="px-6 py-2.5 bg-rose-500/10 border border-rose-500 hover:bg-rose-500 hover:text-white text-rose-400 rounded-lg font-medium transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
