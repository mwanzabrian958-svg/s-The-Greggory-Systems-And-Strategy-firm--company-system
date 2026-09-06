/**
 * Department NavBar links — the modules assigned to each department
 * (per the Web Master → Department assignment map)
 */
import {
  Home, LayoutGrid, Building2, FileText, FolderKanban, Briefcase,
  CheckSquare, ClipboardList, Palette, Image, Search, Server, Users,
  ShieldCheck, Activity, Lock, Shield, TrendingUp, Megaphone,
  MessageSquare, BarChart3, UserCheck, Calculator, DollarSign,
  BookOpen, Smartphone, LifeBuoy
} from 'lucide-react';

export const DEPARTMENT_NAV_BARS = {
  executive: [
    { label: 'Overview', path: '/admin/departments/executive', icon: Home },
    { label: 'Master Dashboard', path: '/admin', icon: LayoutGrid },
    { label: 'Departments Hub', path: '/admin/departments', icon: Building2 },
    { label: 'Reports', path: '/admin/reports', icon: FileText }
  ],
  development: [
    { label: 'Overview', path: '/admin/departments/development', icon: FolderKanban },
    { label: 'Projects', path: '/admin/projects', icon: Briefcase },
    { label: 'Project Tasks', path: '/admin/projects/tasks', icon: CheckSquare }
  ],
  consulting: [
    { label: 'Overview', path: '/admin/departments/consulting', icon: Briefcase },
    { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
    { label: 'Search', path: '/admin/search', icon: Search }
  ],
  delivery: [
    { label: 'Overview', path: '/admin/departments/delivery', icon: ClipboardList },
    { label: 'Projects', path: '/admin/projects', icon: FolderKanban },
    { label: 'Project Tasks', path: '/admin/projects/tasks', icon: CheckSquare }
  ],
  design: [
    { label: 'Overview', path: '/admin/departments/design', icon: Palette },
    { label: 'Media Library', path: '/admin/media', icon: Image }
  ],
  tech: [
    { label: 'Overview', path: '/admin/departments/tech', icon: Server },
    { label: 'User Management', path: '/admin/users', icon: Users },
    { label: 'Settings', path: '/admin/settings', icon: ShieldCheck },
    { label: 'Activity Logs', path: '/admin/activity', icon: Activity },
    { label: 'Data Safety', path: '/admin/data-safety', icon: Lock },
    { label: 'Permissions', path: '/admin/permissions', icon: Shield },
    { label: 'Security', path: '/admin/security', icon: ShieldCheck }
  ],
  sales: [
    { label: 'Overview', path: '/admin/departments/sales', icon: TrendingUp },
    { label: 'Clients', path: '/admin/users', icon: Users },
    { label: 'Search', path: '/admin/search', icon: Search }
  ],
  marketing: [
    { label: 'Overview', path: '/admin/departments/marketing', icon: Megaphone },
    { label: 'Message Center', path: '/admin/messages', icon: MessageSquare },
    { label: 'Blog Management', path: '/admin/content', icon: Briefcase },
    { label: 'Reports', path: '/admin/reports', icon: BarChart3 }
  ],
  research: [
    { label: 'Overview', path: '/admin/departments/research', icon: BarChart3 },
    { label: 'Reports', path: '/admin/reports', icon: FileText },
    { label: 'Search', path: '/admin/search', icon: Search }
  ],
  hr: [
    { label: 'Overview', path: '/admin/departments/hr', icon: UserCheck },
    { label: 'Personnel', path: '/admin/personnel', icon: Users },
    { label: 'Team', path: '/admin/team', icon: Users },
    { label: 'Applications', path: '/admin/applications', icon: ClipboardList }
  ],
  'finance-legal': [
    { label: 'Overview', path: '/admin/departments/finance-legal', icon: Calculator },
    { label: 'Financial Hub', path: '/admin/billing', icon: DollarSign },
    { label: 'Create Invoice', path: '/admin/billing/create', icon: FileText },
    { label: 'Ledger Entry', path: '/admin/billing/entry', icon: BookOpen },
    { label: 'P&L Report', path: '/admin/billing/pl-report', icon: BarChart3 },
    { label: 'M-Pesa', path: '/admin/mpesa', icon: Smartphone },
    { label: 'Reports', path: '/admin/reports', icon: BarChart3 }
  ],
  operations: [
    { label: 'Overview', path: '/admin/departments/operations', icon: Building2 },
    { label: 'Support', path: '/admin/support', icon: LifeBuoy }
  ]
};