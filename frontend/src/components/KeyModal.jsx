import { useState } from 'react';
import { Copy, Check, X } from 'lucide-react';

export default function KeyModal({ apiKey, onClose }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-panel border border-slate-700 rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">API Key Created</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-3 rounded-lg text-sm mb-4">
          <strong>Important:</strong> Please copy this key now. For your security, we cannot show it to you again.
        </div>

        <div className="flex items-center gap-2 mb-6">
          <code className="flex-1 bg-darker p-3 rounded-lg border border-slate-800 font-mono text-emerald-400 break-all text-sm">
            {apiKey}
          </code>
          <button 
            onClick={copyToClipboard}
            className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors"
            title="Copy to clipboard"
          >
            {copied ? <Check size={20} className="text-emerald-400" /> : <Copy size={20} />}
          </button>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-2.5 bg-primary hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
        >
          I've copied it
        </button>
      </div>
    </div>
  );
}
