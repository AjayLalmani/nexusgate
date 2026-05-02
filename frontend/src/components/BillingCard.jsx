import { Check } from 'lucide-react';

export default function BillingCard({ title, price, features, isCurrent, onUpgrade, highlight }) {
  return (
    <div className={`relative p-6 rounded-2xl border ${highlight ? 'border-primary bg-primary/5 shadow-[0_0_30px_rgba(99,102,241,0.15)]' : 'border-slate-800 bg-slate-800/20'} flex flex-col`}>
      {isCurrent && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-white text-xs font-bold rounded-full uppercase tracking-wider">
          Current Plan
        </span>
      )}
      
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <div className="flex items-end gap-1">
          <span className="text-3xl font-extrabold text-white">${price}</span>
          <span className="text-slate-400 mb-1">/month</span>
        </div>
      </div>
      
      <ul className="flex-1 space-y-3 mb-6">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
            <Check size={18} className="text-emerald-400 shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      
      <button 
        onClick={onUpgrade}
        disabled={isCurrent}
        className={`w-full py-2.5 rounded-lg font-medium transition-all ${
          isCurrent 
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
            : highlight 
              ? 'bg-primary hover:bg-indigo-500 text-white shadow-lg shadow-primary/20' 
              : 'bg-slate-700 hover:bg-slate-600 text-white'
        }`}
      >
        {isCurrent ? 'Active' : 'Upgrade to ' + title}
      </button>
    </div>
  );
}
