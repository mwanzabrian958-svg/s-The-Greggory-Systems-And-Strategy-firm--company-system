import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * DepartmentNavBar — each department page renders this strip so the
 * department has its OWN navigation with only ITS assigned modules.
 */
export default function DepartmentNavBar({ links = [] }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="mb-6 bg-white dark:bg-[#032457] border border-slate-200 dark:border-[#0E3A6E] rounded-2xl p-1.5 shadow-sm flex items-center gap-1 overflow-x-auto no-scrollbar">
      {links.map((link) => {
        const Icon = link.icon;
        const active = location.pathname === link.path;
        return (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
              active
                ? 'bg-[#002D62] text-white shadow-lg'
                : 'text-slate-500 dark:text-slate-400 hover:text-[#002D62] dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <Icon size={14} className={active ? 'text-white' : 'text-[#3B82F6]'} />
            {link.label}
          </button>
        );
      })}
    </nav>
  );
}