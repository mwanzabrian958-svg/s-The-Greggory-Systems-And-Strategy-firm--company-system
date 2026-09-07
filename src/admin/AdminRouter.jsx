import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AdminRoute } from './components/AdminRoute';
import AdminLayout from './components/AdminLayout';

// ---- Code-split admin pages (loaded on demand per route) ----
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const AdvancedDashboard = lazy(() => import('./pages/AdvancedDashboard').then(m => ({ default: m.AdvancedDashboard })));
const Users = lazy(() => import('./pages/Users').then(m => ({ default: m.Users })));
const Content = lazy(() => import('./pages/Content').then(m => ({ default: m.Content })));
const Projects = lazy(() => import('./pages/Projects').then(m => ({ default: m.Projects })));
const Applications = lazy(() => import('./pages/Applications').then(m => ({ default: m.Applications })));
const ActivityLogs = lazy(() => import('./pages/Activity').then(m => ({ default: m.ActivityLogs })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const Support = lazy(() => import('./pages/Support').then(m => ({ default: m.Support })));
const Security = lazy(() => import('./pages/Security').then(m => ({ default: m.Security })));
const Reports = lazy(() => import('./pages/Reports').then(m => ({ default: m.Reports })));
const Billing = lazy(() => import('./pages/Financial').then(m => ({ default: m.Billing })));
const CreateInvoice = lazy(() => import('./pages/CreateInvoice').then(m => ({ default: m.CreateInvoice })));
const ManualEntry = lazy(() => import('./pages/ManualEntry').then(m => ({ default: m.ManualEntry })));
const ProfitLossReport = lazy(() => import('./pages/ProfitLossReport').then(m => ({ default: m.ProfitLossReport })));
const InvoicePreview = lazy(() => import('./pages/InvoicePreview').then(m => ({ default: m.InvoicePreview })));
const UserForm = lazy(() => import('./pages/UserForm').then(m => ({ default: m.UserForm })));
const UserDetail = lazy(() => import('./pages/UserDetail').then(m => ({ default: m.UserDetail })));
const CreateBlog = lazy(() => import('./pages/CreateBlog').then(m => ({ default: m.CreateBlog })));
const BlogPreview = lazy(() => import('./pages/BlogPreview').then(m => ({ default: m.BlogPreview })));
const Personnel = lazy(() => import('./pages/Personnel').then(m => ({ default: m.Personnel })));
const CreatePersonnel = lazy(() => import('./pages/CreatePersonnel').then(m => ({ default: m.CreatePersonnel })));
const PersonnelPreview = lazy(() => import('./pages/PersonnelPreview').then(m => ({ default: m.PersonnelPreview })));
const ProjectTasks = lazy(() => import('./pages/ProjectTasks').then(m => ({ default: m.ProjectTasks })));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail').then(m => ({ default: m.ProjectDetail })));
const SearchResults = lazy(() => import('./pages/SearchResults').then(m => ({ default: m.SearchResults })));
const Team = lazy(() => import('./pages/Team').then(m => ({ default: m.Team })));
const DataSafety = lazy(() => import('./pages/DataSafety').then(m => ({ default: m.DataSafety })));
const MediaLibrary = lazy(() => import('./pages/MediaLibrary').then(m => ({ default: m.MediaLibrary })));
const EmailInbox = lazy(() => import('./pages/EmailInbox').then(m => ({ default: m.EmailInbox })));
const PermissionsManager = lazy(() => import('./pages/PermissionsManager').then(m => ({ default: m.PermissionsManager })));
const MpesaSendMoney = lazy(() => import('./pages/MpesaSendMoney').then(m => ({ default: m.MpesaSendMoney })));
const ExecutiveDashboard = lazy(() => import('./pages/ExecutiveDashboard'));
const DevelopmentHub = lazy(() => import('./pages/DevelopmentHub'));
const ConsultingStudio = lazy(() => import('./pages/ConsultingStudio'));
const DeliveryCenter = lazy(() => import('./pages/DeliveryCenter'));
const DesignStudio = lazy(() => import('./pages/DesignStudio'));
const TechServices = lazy(() => import('./pages/TechServices'));
const SalesHub = lazy(() => import('./pages/SalesHub'));
const MarketingCommand = lazy(() => import('./pages/MarketingCommand'));
const ResearchLab = lazy(() => import('./pages/ResearchLab'));
const HRTemple = lazy(() => import('./pages/HRTemple'));
const FinanceLegal = lazy(() => import('./pages/FinanceLegal'));
const OperationsCenter = lazy(() => import('./pages/OperationsCenter'));
const DepartmentsHub = lazy(() => import('./pages/DepartmentsHub'));

import { PERMISSIONS } from './utils/permissions';
import { apiCall } from '../services/api';

export function AdminRouter() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => { verifySession(); }, []);

  const verifySession = async () => {
    try {
      const sessionStr = sessionStorage.getItem('gf_admin_session') || localStorage.getItem('gf_admin_session');
      if (!sessionStr || sessionStr === "undefined") { setIsLoading(false); return; }
      const session = JSON.parse(sessionStr);
      const token = session?.token || localStorage.getItem('gf_admin_session_token');
      if (!token) { setIsLoading(false); return; }
      const data = await apiCall("/admin/session", { headers: { 'Authorization': `Bearer ${token}` } });
      if (data.success && data.user) { setUser(data.user); setIsAuthenticated(true); } else { handleLogout(); }
    } catch (e) { console.error("Session sync failure", e); } finally { setIsLoading(false); }
  };

  const handleLogout = () => {
    sessionStorage.clear(); localStorage.clear(); setUser(null); setIsAuthenticated(false);
    // Return to the department-tile portal (Web Master + 12 department tiles)
    if (!location.pathname.includes('/login')) navigate('/dashboard', { replace: true });
  };

  if (isLoading) return (
    <div className="min-h-screen bg-[#00122B] flex flex-col items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-[7px] font-black text-slate-600 uppercase tracking-[0.6em]">Synchronizing Secure Relay...</p>
    </div>
  );

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#00122B] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-[7px] font-black text-slate-600 uppercase tracking-[0.6em]">Loading Module...</p>
      </div>
    }>
    <Routes>
      <Route path="login" element={isAuthenticated ? <Navigate to="/admin" replace /> : <Login onLoginSuccess={(u) => { setUser(u); setIsAuthenticated(true); }} />} />

      {/* WORKSTATIONS */}
      <Route path="billing/create" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><CreateInvoice /></AdminRoute>} />
      <Route path="billing/entry" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><ManualEntry /></AdminRoute>} />
      <Route path="billing/pl-report" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><ProfitLossReport /></AdminRoute>} />
      <Route path="billing/preview/:id" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><InvoicePreview /></AdminRoute>} />
      <Route path="users/manage" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><UserForm /></AdminRoute>} />
      <Route path="users/manage/:id" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><UserForm /></AdminRoute>} />
      <Route path="users/detail/:id/:roleType" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><UserDetail /></AdminRoute>} />
      <Route path="content/create" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><CreateBlog /></AdminRoute>} />
      <Route path="content/preview/:id" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><BlogPreview /></AdminRoute>} />
      <Route path="projects/:projectId/tasks" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><ProjectTasks /></AdminRoute>} />
              <Route path="projects/:id" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><ProjectDetail /></AdminRoute>} />
      <Route path="personnel/create" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><CreatePersonnel /></AdminRoute>} />
      <Route path="personnel/preview/:id" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><PersonnelPreview /></AdminRoute>} />

      <Route path="*" element={
        isAuthenticated ? (
          <AdminLayout user={user} onLogout={handleLogout}>
            <Routes>
              <Route index element={<AdvancedDashboard user={user} />} />
               <Route path="users" element={<AdminRoute user={user} isAuthenticated={isAuthenticated} requiredPermission={PERMISSIONS.VIEW_USERS}><Users /></AdminRoute>} />
               <Route path="projects" element={<AdminRoute user={user} isAuthenticated={isAuthenticated} requiredPermission={PERMISSIONS.VIEW_PROJECTS}><Projects user={user} /></AdminRoute>} />
               <Route path="billing" element={<AdminRoute user={user} isAuthenticated={isAuthenticated} requiredPermission={PERMISSIONS.VIEW_FINANCIAL}><Billing /></AdminRoute>} />
               <Route path="mpesa" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><MpesaSendMoney /></AdminRoute>} />
               <Route path="content" element={<AdminRoute user={user} isAuthenticated={isAuthenticated} requiredPermission={PERMISSIONS.VIEW_CONTENT}><Content user={user} /></AdminRoute>} />
              <Route path="personnel" element={<AdminRoute user={user} isAuthenticated={isAuthenticated} requiredPermission={PERMISSIONS.VIEW_CONTENT}><Personnel /></AdminRoute>} />
               <Route path="applications" element={<AdminRoute user={user} isAuthenticated={isAuthenticated} requiredPermission={PERMISSIONS.VIEW_APPLICATIONS}><Applications /></AdminRoute>} />
               <Route path="support" element={<AdminRoute user={user} isAuthenticated={isAuthenticated} requiredPermission={PERMISSIONS.VIEW_SUPPORT}><Support /></AdminRoute>} />
               <Route path="security" element={<AdminRoute user={user} isAuthenticated={isAuthenticated} requiredPermission={PERMISSIONS.VIEW_SECURITY}><Security /></AdminRoute>} />
               <Route path="reports" element={<AdminRoute user={user} isAuthenticated={isAuthenticated} requiredPermission={PERMISSIONS.VIEW_REPORTS}><Reports user={user} /></AdminRoute>} />
               <Route path="settings" element={<AdminRoute user={user} isAuthenticated={isAuthenticated} requiredPermission={PERMISSIONS.VIEW_SETTINGS}><Settings user={user} /></AdminRoute>} />
               <Route path="activity" element={<AdminRoute user={user} isAuthenticated={isAuthenticated} requiredPermission={PERMISSIONS.VIEW_ACTIVITY_LOGS}><ActivityLogs /></AdminRoute>} />
               <Route path="team" element={<AdminRoute user={user} isAuthenticated={isAuthenticated} requiredPermission={PERMISSIONS.MANAGE_TEAM}><Team /></AdminRoute>} />
               <Route path="data-safety" element={<AdminRoute user={user} isAuthenticated={isAuthenticated} requiredPermission={PERMISSIONS.VIEW_DATA_SAFETY}><DataSafety /></AdminRoute>} />
                <Route path="media" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><MediaLibrary /></AdminRoute>} />
                <Route path="messages" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><EmailInbox /></AdminRoute>} />
                <Route path="permissions" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><PermissionsManager /></AdminRoute>} />
               <Route path="search" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><SearchResults /></AdminRoute>} />
                {/* Department Dashboards */}
                <Route path="departments" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><DepartmentsHub /></AdminRoute>} />
                <Route path="departments/executive" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><ExecutiveDashboard /></AdminRoute>} />
                <Route path="departments/development" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><DevelopmentHub /></AdminRoute>} />
                <Route path="departments/consulting" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><ConsultingStudio /></AdminRoute>} />
                <Route path="departments/delivery" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><DeliveryCenter /></AdminRoute>} />
                <Route path="departments/design" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><DesignStudio /></AdminRoute>} />
                <Route path="departments/tech" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><TechServices /></AdminRoute>} />
                <Route path="departments/sales" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><SalesHub /></AdminRoute>} />
                <Route path="departments/marketing" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><MarketingCommand /></AdminRoute>} />
                <Route path="departments/research" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><ResearchLab /></AdminRoute>} />
                <Route path="departments/hr" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><HRTemple /></AdminRoute>} />
                <Route path="departments/finance-legal" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><FinanceLegal /></AdminRoute>} />
                <Route path="departments/operations" element={<AdminRoute user={user} isAuthenticated={isAuthenticated}><OperationsCenter /></AdminRoute>} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </AdminLayout>
        ) : (
          <Navigate to="/admin/login" replace />
        )
      } />
    </Routes>
    </Suspense>
  );
}
