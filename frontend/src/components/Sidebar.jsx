import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Globe, CreditCard, Settings } from 'lucide-react';

export default function Sidebar() {
  const links = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'APIs', path: '/apis', icon: Globe },
    { name: 'Billing', path: '/billing', icon: CreditCard },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-dark h-[calc(100vh-4rem)] p-4 flex flex-col gap-2">
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-4 px-3">Menu</div>
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? 'text-primary' : ''} />
                <span className="font-medium">{link.name}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </aside>
  );
}
