import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, User } from 'lucide-react';
import api from '../services/api';

export default function Navbar() {
  const { user, logout, refreshToken } = useAuthStore();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout', { refreshToken });
    } catch (err) {
      console.error(err);
    } finally {
      logout();
    }
  };

  return (
    <nav className="h-16 border-b border-slate-800 bg-darker/90 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white">N</div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-400">NexusGate</span>
      </div>
      
      {user && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-300 bg-panel px-3 py-1.5 rounded-full border border-slate-700">
            <User size={16} />
            <span>{user.name}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      )}
    </nav>
  );
}
