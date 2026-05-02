import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import ApiTable from '../components/ApiTable';
import KeyModal from '../components/KeyModal';
import api from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';

export default function APIs() {
  const [apis, setApis] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Key Modal logic
  const [newKey, setNewKey] = useState(null);

  const fetchApis = async () => {
    try {
      const res = await api.get('/apis');
      setApis(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApis();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/apis/create', { name, targetUrl });
      setShowCreate(false);
      setName('');
      setTargetUrl('');
      fetchApis();
    } catch (err) {
      console.error(err);
      alert('Failed to create API');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this API?')) {
      try {
        await api.delete(`/apis/${id}`);
        fetchApis();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // If a specific API is selected to view keys
  const { id } = useParams();
  const navigate = useNavigate();
  const [keys, setKeys] = useState([]);
  const [keyLabel, setKeyLabel] = useState('');

  useEffect(() => {
    if (id) {
      const fetchKeys = async () => {
        try {
          const res = await api.get(`/apis/${id}/keys`);
          setKeys(res.data);
        } catch (err) {
          console.error(err);
        }
      };
      fetchKeys();
    }
  }, [id]);

  const handleCreateKey = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/apis/${id}/keys`, { label: keyLabel });
      setNewKey(res.data.key); // Raw key shown once
      setKeyLabel('');
      // refresh keys list
      const keysRes = await api.get(`/apis/${id}/keys`);
      setKeys(keysRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevokeKey = async (keyId) => {
    if (confirm('Revoke this key? It will stop working immediately.')) {
      try {
        await api.delete(`/apis/${id}/keys/${keyId}`);
        const keysRes = await api.get(`/apis/${id}/keys`);
        setKeys(keysRes.data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  if (id) {
    return (
      <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-300">
        <button onClick={() => navigate('/apis')} className="text-primary hover:text-indigo-400 font-medium mb-6 flex items-center gap-2">
          &larr; Back to APIs
        </button>
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h2 className="text-2xl font-bold text-white mb-6">Manage API Keys</h2>
          
          <form onSubmit={handleCreateKey} className="flex gap-4 mb-8">
            <input 
              type="text" 
              placeholder="Key Label (e.g. Production)" 
              value={keyLabel}
              onChange={e => setKeyLabel(e.target.value)}
              className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:outline-none"
              required
            />
            <button type="submit" className="bg-primary hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              Generate New Key
            </button>
          </form>

          <div className="space-y-4">
            {keys.length > 0 ? keys.map(k => (
              <div key={k._id} className="flex items-center justify-between bg-slate-800/30 p-4 rounded-xl border border-slate-800/50">
                <div>
                  <h4 className="font-bold text-white">{k.label}</h4>
                  <p className="text-sm text-slate-400">Created: {new Date(k.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  {k.isRevoked ? (
                    <span className="px-3 py-1 bg-rose-500/10 text-rose-400 rounded text-sm font-medium">Revoked</span>
                  ) : (
                    <button onClick={() => handleRevokeKey(k._id)} className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-sm font-medium transition-colors">
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            )) : <p className="text-slate-500 text-center py-4">No keys generated yet.</p>}
          </div>
        </div>
        {newKey && <KeyModal apiKey={newKey} onClose={() => setNewKey(null)} />}
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">API Endpoints</h1>
        <button 
          onClick={() => setShowCreate(!showCreate)}
          className="bg-primary hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg shadow-primary/20"
        >
          <Plus size={18} />
          Create API
        </button>
      </div>

      {showCreate && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 mb-8 animate-in slide-in-from-top-4 duration-300">
          <h2 className="text-xl font-bold text-white mb-4">New Endpoint</h2>
          <form onSubmit={handleCreate} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="My Awesome API" className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Target URL</label>
              <input type="url" value={targetUrl} onChange={e => setTargetUrl(e.target.value)} placeholder="https://api.example.com" className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:outline-none" required />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-primary hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors">Save</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-panel p-2 rounded-2xl border border-slate-800">
        <ApiTable apis={apis} onDelete={handleDelete} />
      </div>
    </div>
  );
}
