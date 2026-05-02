import { Link } from 'react-router-dom';
import { Settings, Trash2, Key } from 'lucide-react';

export default function ApiTable({ apis, onDelete }) {
  if (apis.length === 0) {
    return (
      <div className="text-center py-10 bg-slate-800/20 rounded-xl border border-slate-800 border-dashed">
        <p className="text-slate-400">No APIs found. Create one to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800 text-slate-400 text-sm">
            <th className="pb-3 font-medium">Name</th>
            <th className="pb-3 font-medium">Target URL</th>
            <th className="pb-3 font-medium">Status</th>
            <th className="pb-3 font-medium">Created</th>
            <th className="pb-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {apis.map((api) => (
            <tr key={api._id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
              <td className="py-4 font-medium text-slate-200">{api.name}</td>
              <td className="py-4 text-slate-400 text-sm max-w-[200px] truncate">{api.targetUrl}</td>
              <td className="py-4">
                <span className={`px-2 py-1 rounded text-xs font-medium ${api.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                  {api.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="py-4 text-slate-500 text-sm">
                {new Date(api.createdAt).toLocaleDateString()}
              </td>
              <td className="py-4 flex justify-end gap-2">
                <Link to={`/apis/${api._id}`} className="p-2 text-slate-400 hover:text-primary bg-slate-800/50 hover:bg-slate-800 rounded transition-colors" title="Manage Keys">
                  <Key size={16} />
                </Link>
                <button onClick={() => onDelete(api._id)} className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800/50 hover:bg-slate-800 rounded transition-colors" title="Delete API">
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
