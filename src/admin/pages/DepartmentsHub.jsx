import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Crown, FolderKanban, Briefcase, ClipboardList, Palette, Server,
  TrendingUp, Megaphone, BarChart3, UserCheck, Calculator, Building2, RefreshCw,
  Target, CheckCircle, Scale, ShieldAlert, Rocket
} from 'lucide-react';
import { apiCall } from '../../services/api';

// Hardcoded department data (matches App.tsx DEPARTMENT_TILES)
const FALLBACK_DEPARTMENTS = [
  { id: 1, name: 'Executive Office', slug: 'executive-office', description: 'Strategy & Oversight', icon: 'Crown', color: '#002D62' },
  { id: 2, name: 'Finance & Legal', slug: 'finance-legal', description: 'Ledger & Contracts', icon: 'Calculator', color: '#002D62' },
  { id: 3, name: 'Human Resources', slug: 'human-resources', description: 'People & Culture', icon: 'UserCheck', color: '#002D62' },
  { id: 4, name: 'IT Services', slug: 'information-technology', description: 'Infrastructure & DevOps', icon: 'Server', color: '#002D62' },
  { id: 5, name: 'Marketing', slug: 'marketing', description: 'Campaigns & Content', icon: 'Megaphone', color: '#002D62' },
  { id: 6, name: 'Operations', slug: 'operations', description: 'Facilities & Vendors', icon: 'Building2', color: '#002D62' },
  { id: 7, name: 'Strategic Planning', slug: 'strategic-planning', description: 'Roadmap & Goals', icon: 'Target', color: '#002D62' },
  { id: 8, name: 'Business Development', slug: 'business-development', description: 'Partnerships & Growth', icon: 'Briefcase', color: '#002D62' },
  { id: 9, name: 'Quality Assurance', slug: 'quality-assurance', description: 'Compliance & Testing', icon: 'CheckCircle', color: '#002D62' },
  { id: 10, name: 'Legal Affairs', slug: 'legal-affairs', description: 'Contracts & Compliance', icon: 'Scale', color: '#002D62' },
  { id: 11, name: 'Compliance', slug: 'compliance', description: 'Regulatory & Risk', icon: 'ShieldAlert', color: '#002D62' },
  { id: 12, name: 'Special Projects', slug: 'special-projects', description: 'Initiatives & Delivery', icon: 'Rocket', color: '#002D62' }
];

// Icon mapping from DB icon names to lucide components
const ICON_MAP = {
  Crown, FolderKanban, Briefcase, ClipboardList, Palette, Server,
  TrendingUp, Megaphone, BarChart3, UserCheck, Calculator, Building2,
  Target, CheckCircle, Scale, ShieldAlert, Rocket
};

export default function DepartmentsHub() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState(FALLBACK_DEPARTMENTS);
  const [loading, setLoading] = useState(false);

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
        {departments.map((dept) => {
          const Icon = ICON_MAP[dept.icon] || Building2;
          return (
            <button
              key={dept.slug}
              onClick={() => navigate(`/admin/departments/${dept.slug}`)}
              className="group relative bg-white dark:bg-[#032457] border border-slate-200 dark:border-[#0E3A6E] rounded-2xl p-6 text-left shadow-sm hover:shadow-2xl hover:-translate-y-1 hover:border-[#3B82F6] dark:hover:border-[#3B82F6] transition-all duration-300"
            >
              {/* Media */}
              <div className="h-28 mb-4 rounded-xl bg-gradient-to-br from-[#002D62] to-[#032457] flex items-center justify-center overflow-hidden">
                <Icon className="h-12 w-12 text-[#93C5FD] group-hover:text-white group-hover:scale-110 transition-all duration-300" />
              </div>

              {/* Label */}
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{dept.name}</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#3B82F6] mt-1.5">{dept.description || ''}</p>

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