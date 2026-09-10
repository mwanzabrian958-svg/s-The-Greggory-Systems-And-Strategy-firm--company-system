import { lazy, Suspense, useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Code-split: the entire admin suite loads on demand, never in the entry bundle
const AdminRouter = lazy(() =>
  import('./admin/AdminRouter').then((m) => ({ default: m.AdminRouter })),
);
import {
  Crown,
  Briefcase,
  Server,
  Megaphone,
  UserCheck,
  Calculator,
  Building2,
  LayoutGrid,
  Target,
  CheckCircle,
  Scale,
  ShieldAlert,
  Rocket,
  LogIn,
} from 'lucide-react';

const DEPARTMENT_TILES = [
  {
    path: '/admin/departments/executive-office',
    label: 'Executive Office',
    subtitle: 'Strategy & Oversight',
    icon: Crown,
    image: '/department-icons/executive.jpg',
  },
  {
    path: '/admin/departments/finance-legal',
    label: 'Finance & Legal',
    subtitle: 'Ledger & Contracts',
    icon: Calculator,
    image: '/department-icons/finance.png',
  },
  {
    path: '/admin/departments/human-resources',
    label: 'Human Resources',
    subtitle: 'People & Culture',
    icon: UserCheck,
    image: '/department-icons/hr.png',
  },
  {
    path: '/admin/departments/information-technology',
    label: 'IT Services',
    subtitle: 'Infrastructure & DevOps',
    icon: Server,
    image: '/department-icons/it.png',
  },
  {
    path: '/admin/departments/marketing',
    label: 'Marketing',
    subtitle: 'Campaigns & Content',
    icon: Megaphone,
    image: '/department-icons/marketing.png',
  },
  {
    path: '/admin/departments/operations',
    label: 'Operations',
    subtitle: 'Facilities & Vendors',
    icon: Building2,
    image: '/department-icons/operations.jpg',
  },
  {
    path: '/admin/departments/strategic-planning',
    label: 'Strategic Planning',
    subtitle: 'Roadmap & Goals',
    icon: Target,
    image: '/department-icons/strategy.jpg',
  },
  {
    path: '/admin/departments/business-development',
    label: 'Business Development',
    subtitle: 'Partnerships & Growth',
    icon: Briefcase,
    image: '/department-icons/business.jpg',
  },
  {
    path: '/admin/departments/quality-assurance',
    label: 'Quality Assurance',
    subtitle: 'Compliance & Testing',
    icon: CheckCircle,
    image: '/department-icons/qa.jpg',
  },
  {
    path: '/admin/departments/legal-affairs',
    label: 'Legal Affairs',
    subtitle: 'Contracts & Compliance',
    icon: Scale,
    image: '/department-icons/legal.jpg',
  },
  {
    path: '/admin/departments/compliance',
    label: 'Compliance',
    subtitle: 'Regulatory & Risk',
    icon: ShieldAlert,
    image: '/department-icons/compliance.jpg',
  },
  {
    path: '/admin/departments/special-projects',
    label: 'Special Projects',
    subtitle: 'Initiatives & Delivery',
    icon: Rocket,
    image: '/department-icons/projects.jpg',
  },
];

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-landing-blue font-sans text-white relative overflow-hidden w-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center gap-6 z-10 w-full px-6"
      >
        <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-2 border-[#60A5FA]/40 bg-white/10 backdrop-blur-md flex items-center justify-center shadow-[0_0_50px_rgba(96,165,250,0.25)] relative overflow-hidden group">
          <img
            src="/logo.jpg"
            alt="The Greggory Systems Logo"
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 border-t border-r border-[#60A5FA]/25 rounded-full pointer-events-none"
          />
        </div>

        <div className="text-center space-y-2 w-full">
          <h1 className="text-xl md:text-3xl font-black tracking-widest uppercase font-heading drop-shadow-lg">
            The Greggory Systems
          </h1>
        </div>

        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: '#60A5FA', color: '#00122B' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/dashboard')}
          className="border border-[#60A5FA] text-[#60A5FA] px-12 py-2.5 rounded-full font-bold text-[10px] tracking-[0.5em] transition-all duration-300 shadow-[0_0_15px_rgba(96,165,250,0.15)] hover:shadow-[#60A5FA]/30 uppercase"
        >
          ENTER
        </motion.button>
      </motion.div>
    </div>
  );
};

const InstitutionalCockpit = () => {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const sessionStr = localStorage.getItem('gf_admin_session');
    if (sessionStr) {
      try {
        setAdminUser(JSON.parse(sessionStr).user);
      } catch (e) {
        setAdminUser(null);
      }
    }
    setChecked(true);
  }, []);

  if (!checked)
    return (
      <div className="min-h-screen bg-[#00122B] flex items-center justify-center text-white">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] to-[#E8F0FB] dark:from-[#00122B] dark:to-[#001A3D] text-slate-600 dark:text-zinc-300 font-sans p-8 animate-in fade-in duration-700 w-full">
      {/* Web Master Workstation tile (kept) */}
      <div className="flex justify-center mb-12">
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          onClick={() => navigate('/admin')}
          className="p-10 border-2 border-[#002D62]/10 dark:border-[#3B82F6]/10 bg-white dark:bg-[#032457]/80 text-center cursor-pointer group hover:border-[#002D62]/60 dark:hover:border-[#3B82F6]/60 transition-all duration-500 rounded-3xl shadow-2xl shadow-black/5 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-[#002D62]/5 dark:from-[#3B82F6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-40 h-40 mx-auto mb-8 rounded-2xl overflow-hidden border border-slate-100 dark:border-[#0E3A6E] shadow-2xl group-hover:shadow-[#002D62]/20 dark:group-hover:shadow-[#3B82F6]/20 transition-all bg-black/5 p-2">
            <img
              src="/webmaster_logo.jpg"
              alt="Web Master"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 rounded-lg"
            />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-2">
            Web Master
          </h3>
          <p className="text-xs text-[#002D62] dark:text-[#3B82F6] uppercase font-mono tracking-widest">
            Administrative Management Suite
          </p>
          <div className="mt-6 flex justify-center">
            <div className="px-5 py-2 bg-[#002D62] dark:bg-[#3B82F6] rounded-full text-[10px] text-white font-bold tracking-[0.2em] flex items-center gap-2">
              <LogIn size={12} />
              Sign In
            </div>
          </div>
        </motion.div>
      </div>

      {/* Departments — 12 tiles, 4 across x 3 down */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto mb-3 bg-[#002D62] rounded-xl flex items-center justify-center text-white shadow-lg border border-white/10">
            <LayoutGrid className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-black text-[#002D62] dark:text-white uppercase tracking-tight">
            Departments
          </h2>
          <p className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-[0.4em] mt-2">
            Master Command — All Divisions
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {DEPARTMENT_TILES.map((dept) => {
            const Icon = dept.icon;
            return (
              <motion.button
                key={dept.path}
                whileHover={{ y: -4 }}
                onClick={() => navigate(dept.path)}
                className="group relative bg-white dark:bg-[#032457]/80 border border-slate-200 dark:border-[#0E3A6E] rounded-2xl p-5 text-left shadow-sm hover:shadow-2xl hover:border-[#3B82F6] transition-all duration-300 cursor-pointer"
              >
                <div className="h-24 mb-4 rounded-xl bg-gradient-to-br from-[#002D62] to-[#032457] flex items-center justify-center overflow-hidden">
                  {dept.image ? (
                    <img
                      src={dept.image}
                      alt={dept.label}
                      className="h-full w-full object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-300"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <Icon className="h-10 w-10 text-[#93C5FD] group-hover:text-white group-hover:scale-110 transition-all duration-300" />
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  {dept.label}
                </h3>
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#3B82F6] mt-1.5">
                  {dept.subtitle}
                </p>
                <div className="mt-3 inline-flex items-center rounded-full bg-[#3B82F6] px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Enter Workstation
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  useEffect(() => {
    // Sync body background with current route theme
    if (isLanding) {
      document.body.style.backgroundColor = '#002D62';
    } else {
      // Respect dark mode preference for non-landing pages
      const isDark = document.documentElement.classList.contains('dark');
      document.body.style.backgroundColor = isDark ? '#00122B' : '#ffffff';
    }
  }, [isLanding]);

  return (
    <main
      className={`selection:bg-[#002D62] selection:text-white min-h-screen w-full overflow-hidden transition-colors duration-700 ${
        isLanding ? 'bg-landing-blue' : 'bg-firm-black'
      }`}
    >
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<InstitutionalCockpit />} />
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<div className="min-h-screen w-full bg-[#00122B]" />}>
              <AdminRouter />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  );
}
