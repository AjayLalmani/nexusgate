import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/signup', { name, email, password });
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-darker px-4">
      <div className="max-w-md w-full glass-panel p-8 rounded-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white text-2xl mb-4 shadow-lg shadow-primary/20">N</div>
          <h2 className="text-3xl font-bold text-white">Create an account</h2>
          <p className="text-slate-400 mt-2">Start managing your APIs today</p>
        </div>

        {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg mb-6 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              autoComplete="name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full py-2.5 bg-primary hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-primary/20 mt-2"
          >
            Create account
          </button>
        </form>

        <p className="text-center mt-6 text-slate-400 text-sm">
          Already have an account? <Link to="/login" className="text-primary hover:text-indigo-400 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
