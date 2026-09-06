import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Crown, FolderKanban, Briefcase, ClipboardList, Palette, Server,
  TrendingUp, Megaphone, BarChart3, UserCheck, Calculator, Building2
} from 'lucide-react';

const DEPARTMENTS = [
  { path: '/admin/departments/executive', label: 'Executive Office', subtitle: 'Strategy & Oversight', icon: Crown, image: '/department-icons/executive.jpg' },
  { path: '/admin/departments/development', label: 'Project Development', subtitle: 'Build & Engineering', icon: FolderKanban, image: '/department-icons/development.jpg' },
  { path: '/admin/departments/consulting', label: 'Business Consulting', subtitle: 'Client Advisory', icon: Briefcase, image: '/department-icons/consulting.jpg' },
  { path: '/admin/departments/delivery', label: 'Delivery & Implementation', subtitle: 'Rollouts & Timelines', icon: ClipboardList, image: '/department-icons/delivery.jpg' },
  { path: '/admin/departments/design', label: 'Design Studio', subtitle: 'UI/UX & Brand', icon: Palette, image: '/department-icons/design.jpg' },
  { path: '/admin/departments/tech', label: 'Technology Services', subtitle: 'Infrastructure & DevOps', icon: Server, image: '/department-icons/it.png' },
  { path: '/admin/departments/sales', label: 'Sales & Client Relations', subtitle: 'Pipeline & Accounts', icon: TrendingUp, image: '/department-icons/sales.jpg' },
  { path: '/admin/departments/marketing', label: 'Marketing & Communications', subtitle: 'Campaigns & Content', icon: Megaphone, image: '/department-icons/marketing.png' },
  { path: '/admin/departments/research', label: 'Research & Analytics', subtitle: 'Insights & Data', icon: BarChart3, image: '/department-icons/research.jpg' },
  { path: '/admin/departments/hr', label: 'Human Resources', subtitle: 'People & Culture', icon: UserCheck, image: '/department-icons/hr.png' },
  { path: '/admin/departments/finance-legal', label: 'Finance & Legal', subtitle: 'Ledger & Contracts', icon: Calculator, image: '/department-icons/finance.png' },
  { path: '/admin/departments/operations', label: 'Operations', subtitle: 'Facilities & Vendors', icon: Building2, image: '/department-icons/operations.jpg' }
];

export default function DepartmentsHub() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] to-[#E8F0FB] dark:from-[#00122B] dark:to-[#001A3D] p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-10">
        <div className="w-14 h-14 mx-auto mb-4 bg-[#002D62] rounded-2xl flex items-center justify-center text-white shadow-xl border border-white/10">
          <Building2 className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-black text-[#002D62] dark:text-white uppercase tracking-tight">Departments</h1>
        <p className="text-xs font-bold text-[#3B82F6] uppercase tracking-[0.4em] mt-2">Master Command — All Divisions</p>
      </div>

      {/* Tiles */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {DEPARTMENTS.map((dept) => {
          const Icon = dept.icon;
          return (
            <button
              key={dept.path}
              onClick={() => navigate(dept.path)}
              className="group relative bg-white dark:bg-[#032457] border border-slate-200 dark:border-[#0E3A6E] rounded-2xl p-6 text-left shadow-sm hover:shadow-2xl hover:-translate-y-1 hover:border-[#3B82F6] dark:hover:border-[#3B82F6] transition-all duration-300"
            >
              {/* Media */}
              <div className="h-28 mb-4 rounded-xl bg-gradient-to-br from-[#002D62] to-[#032457] flex items-center justify-center overflow-hidden">
                {dept.image ? (
                  <img
                    src={dept.image}
                    alt={dept.label}
                    className="h-full w-full object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-300"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <Icon className="h-12 w-12 text-[#93C5FD] group-hover:text-white group-hover:scale-110 transition-all duration-300" />
                )}
              </div>

              {/* Label */}
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{dept.label}</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#3B82F6] mt-1.5">{dept.subtitle}</p>

              {/* Hover pill */}
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#3B82F6] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Enter Workstation
                <Chevron />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Chevron() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}