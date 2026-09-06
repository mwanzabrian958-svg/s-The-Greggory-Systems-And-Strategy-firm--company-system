/**
 * Admin Permissions System
 * Defines what each role can access
 */

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  DEVELOPER: 'developer',
  USER: 'user',
  // Department roles (redistributed from Web Master)
  WEBMASTER: 'webmaster',
  FINANCE: 'finance',
  IT: 'it',
  HR: 'hr',
  MARKETING: 'marketing',
  PROJECT_MANAGEMENT: 'project_management'
};

// Roles that use department-based navigation filtering
export const DEPARTMENT_ROLES = [
  ROLES.WEBMASTER,
  ROLES.FINANCE,
  ROLES.IT,
  ROLES.HR,
  ROLES.MARKETING,
  ROLES.PROJECT_MANAGEMENT
];

export const PERMISSIONS = {
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  VIEW_CONTENT: 'view_content',
  CREATE_CONTENT: 'create_content',
  EDIT_CONTENT: 'edit_content',
  DELETE_CONTENT: 'delete_content',
  VIEW_PROJECTS: 'view_projects',
  CREATE_PROJECTS: 'create_projects',
  EDIT_PROJECTS: 'edit_projects',
  DELETE_PROJECTS: 'delete_projects',
  VIEW_APPLICATIONS: 'view_applications',
  MANAGE_APPLICATIONS: 'manage_applications',
  VIEW_FINANCIAL: 'view_financial',
  MANAGE_FINANCIAL: 'manage_financial',
  VIEW_SETTINGS: 'view_settings',
  EDIT_SETTINGS: 'edit_settings',
  VIEW_CRM: 'view_crm',
  MANAGE_CLIENTS: 'manage_clients',
  VIEW_TASKS: 'view_tasks',
  MANAGE_PROJECTS: 'manage_projects',
  VIEW_COMMUNICATION: 'view_communication',
  SEND_MESSAGES: 'send_messages',
  VIEW_SUPPORT: 'view_support',
  MANAGE_TICKETS: 'manage_tickets',
  VIEW_SECURITY: 'view_security',
  AUDIT_LOGS: 'audit_logs',
  VIEW_REPORTS: 'view_reports',
  EXPORT_DATA: 'export_data',
  MANAGE_ADMINS: 'manage_admins',
  VIEW_ACTIVITY_LOGS: 'view_activity_logs',
  ACCESS_API_DOCS: 'access_api_docs',
  VIEW_DATABASE: 'view_database',
  MANAGE_BACKUPS: 'manage_backups',
  MANAGE_TEAM: 'manage_team',
  VIEW_DATA_SAFETY: 'view_data_safety',
  MANAGE_DATA_SAFETY: 'manage_data_safety'
};

// Permissions required for legacy admin navigation items
export const NAV_PERMISSION_MAP = {
  '/admin/users': 'VIEW_USERS',
  '/admin/projects': 'VIEW_PROJECTS',
  '/admin/applications': 'VIEW_APPLICATIONS',
  '/admin/content': 'VIEW_CONTENT',
  '/admin/personnel': 'VIEW_CONTENT',
  '/admin/billing': 'VIEW_FINANCIAL',
  '/admin/mpesa': 'VIEW_FINANCIAL',
  '/admin/reports': 'VIEW_REPORTS',
  '/admin/settings': 'VIEW_SETTINGS',
  '/admin/activity': 'VIEW_ACTIVITY_LOGS',
  '/admin/data-safety': 'VIEW_DATA_SAFETY',
  '/admin/team': 'MANAGE_TEAM',
  '/admin/messages': 'VIEW_COMMUNICATION',
  '/admin/permissions': 'VIEW_SETTINGS',
  '/admin/search': 'view_search',
  '/admin/departments': 'VIEW_SETTINGS'
};

// Fixed navigation items per department role (strict filtering)
export const DEPARTMENT_NAVIGATION = {
     [ROLES.WEBMASTER]: [
    { path: '/admin', label: 'Web Master Dashboard', icon: 'Home', image: '/department-icons/webmaster.png' },
    { path: '/admin/content', label: 'Blog Management', icon: 'Briefcase' },
    { path: '/admin/media', label: 'Media Library', icon: 'Image' },
    { path: '/admin/search', label: 'Search', icon: 'Search' }
  ],
  [ROLES.FINANCE]: [
    { path: '/admin', label: 'Finance Dashboard', icon: 'Home', image: '/department-icons/finance.png' },
    { path: '/admin/departments/finance-legal', label: 'Finance & Legal', icon: 'Calculator' },
    { path: '/admin/billing', label: 'Financial Hub', icon: 'Calculator' },
    { path: '/admin/mpesa', label: 'M-Pesa Payments', icon: 'Smartphone' },
    { path: '/admin/reports', label: 'Financial Reports', icon: 'BarChart3' },
    { path: '/admin/search', label: 'Search', icon: 'Search' }
  ],
  [ROLES.IT]: [
    { path: '/admin', label: 'Dashboard', icon: 'Home', image: '/department-icons/it.png' },
    { path: '/admin/departments/tech', label: 'Technology Services', icon: 'ShieldCheck' },
    { path: '/admin/users', label: 'User Management', icon: 'Users' },
    { path: '/admin/settings', label: 'System Settings', icon: 'ShieldCheck' },
    { path: '/admin/activity', label: 'Activity Logs', icon: 'Activity' },
    { path: '/admin/data-safety', label: 'Data Safety', icon: 'Lock' },
    { path: '/admin/permissions', label: 'Permissions Manager', icon: 'ShieldCheck' },
    { path: '/admin/security', label: 'Security', icon: 'ShieldCheck' },
    { path: '/admin/search', label: 'Search', icon: 'Search' }
  ],
  [ROLES.HR]: [
    { path: '/admin', label: 'Dashboard', icon: 'Home', image: '/department-icons/hr.png' },
    { path: '/admin/departments/hr', label: 'HR Dashboard', icon: 'UserCheck' },
    { path: '/admin/personnel', label: 'Personnel Management', icon: 'Users' },
    { path: '/admin/team', label: 'Team Management', icon: 'UserCheck' },
    { path: '/admin/search', label: 'Search', icon: 'Search' }
  ],
  [ROLES.MARKETING]: [
    { path: '/admin', label: 'Dashboard', icon: 'Home', image: '/department-icons/marketing.png' },
    { path: '/admin/departments/marketing', label: 'Marketing Command', icon: 'BarChart3' },
    { path: '/admin/messages', label: 'Message Center', icon: 'MessageSquare' },
    { path: '/admin/reports', label: 'Analytics & Reports', icon: 'BarChart3' },
    { path: '/admin/search', label: 'Search', icon: 'Search' }
  ],
  [ROLES.PROJECT_MANAGEMENT]: [
    { path: '/admin', label: 'Dashboard', icon: 'Home', image: '/department-icons/projects.png' },
    { path: '/admin/departments/delivery', label: 'Delivery Center', icon: 'FolderKanban' },
    { path: '/admin/projects', label: 'Projects', icon: 'FolderKanban' },
    { path: '/admin/projects/tasks', label: 'Project Tasks', icon: 'ClipboardList' },
    { path: '/admin/search', label: 'Search', icon: 'Search' }
  ]
};

export function isAdmin(user) {
  if (!user) return false;
  const level = user.admin_level || user.role;
  const isAdminLevel = ['super_admin', 'admin', 'moderator', 'developer'].includes(level);
  const isDepartmentRole = DEPARTMENT_ROLES.includes(level);
  return isAdminLevel || isDepartmentRole;
}

export function isDeveloper(user) {
  if (!user) return false;
  const level = user.developer_level || user.role;
  return level === 'developer' || !!user.developer_level;
}

export function isSuperAdmin(user) {
  if (!user) return false;
  const level = user.admin_level || user.role;
  return level === ROLES.SUPER_ADMIN;
}

export function hasFullAdminAccess(user) {
  if (!user) return false;
  const level = user.admin_level || user.role;
  return ['super_admin', 'admin'].includes(level);
}

// Check if user has a department role (webmaster, finance, etc.)
export function isDepartmentRole(user) {
  if (!user) return false;
  const level = user.admin_level || user.role;
  return DEPARTMENT_ROLES.includes(level);
}

export function hasPermission(user, permission) {
  if (!user) return false;
  if (hasFullAdminAccess(user)) return true;
  
  // Department roles need explicit permission checking
  if (isDepartmentRole(user)) {
    const rolePerms = getDepartmentRolePermissions(user.role || user.admin_level);
    return rolePerms.permissions.includes(permission) || rolePerms.permissions.includes(permission.replace('VIEW_', ''));
  }
  
  // Legacy roles fall back to default behavior
  return true;
}

export function hasAnyPermission(user, permissions) {
  if (!user || !permissions) return false;
  return permissions.some(p => hasPermission(user, p));
}

export function hasAllPermissions(user, permissions) {
  if (!user || !permissions) return false;
  return permissions.every(p => hasPermission(user, p));
}

// NOTE: duplicate NAV_PERMISSION_MAP / DEPARTMENT_NAVIGATION declarations removed.
// Single exported definitions live at the top of this file.

function cachedRoleLevel(user) {
  const level = user.admin_level || user.role || '';
  if (level === 'super_admin') return 'super';
  if (level === 'admin') return 'admin';
  if (level === 'moderator') return 'manager';
  // Map department roles to appropriate legacy levels for permission matrix
  if (level === ROLES.WEBMASTER) return 'manager'; // web master sees limited items
  if (level === ROLES.FINANCE) return 'viewer';
  if (level === ROLES.IT) return 'manager';
  if (level === ROLES.HR) return 'viewer';
  if (level === ROLES.MARKETING) return 'viewer';
  if (level === ROLES.PROJECT_MANAGEMENT) return 'viewer';
  return 'viewer';
}

export function getRolePermissions(user) {
  if (!user) return null;
  try {
    const matrix = JSON.parse(localStorage.getItem('gf_role_permissions') || 'null');
    if (!matrix) return null;
    const perms = matrix[cachedRoleLevel(user)];
    return Array.isArray(perms) ? perms : null;
  } catch { return null; }
}

// Department role permission mapping (must be defined before getNavigationItems uses it)
function getDepartmentRolePermissions(role) {
  const basePerms = {
    permissions: ['view_content', 'view_search'],
    navPermission: ['view_content']
  };
  
  switch (role) {
    case ROLES.WEBMASTER:
      return {
        permissions: [...basePerms.permissions, 'view_content', 'create_content', 'edit_content'],
        navPermission: ['view_content']
      };
    case ROLES.FINANCE:
      return {
        permissions: [...basePerms.permissions, 'view_financial', 'manage_financial', 'view_reports'],
        navPermission: ['view_financial', 'view_reports']
      };
    case ROLES.IT:
      return {
        permissions: [...basePerms.permissions, 'view_users', 'view_settings', 'view_security', 'view_activity_logs', 'view_data_safety'],
        navPermission: ['view_users', 'view_settings', 'view_security', 'view_activity_logs', 'view_data_safety']
      };
    case ROLES.HR:
      return {
        permissions: [...basePerms.permissions, 'view_content', 'manage_team'],
        navPermission: ['view_content', 'manage_team']
      };
    case ROLES.MARKETING:
      return {
        permissions: [...basePerms.permissions, 'view_communication', 'view_reports'],
        navPermission: ['view_communication', 'view_reports']
      };
    case ROLES.PROJECT_MANAGEMENT:
      return {
        permissions: [...basePerms.permissions, 'view_projects'],
        navPermission: ['view_projects']
      };
    default:
      return { 
        permissions: [...basePerms.permissions], 
        navPermission: ['view_content'] 
      };
  }
}

/**
 * Get navigation items based on user role.
 * Department roles get a fixed, filtered navigation set.
 * Legacy admin roles use the permission-matrix-based filtering.
 */
export function getNavigationItems(user) {
  if (!user) return [];

  // Department roles get predefined navigation (strict filtering)
  if (isDepartmentRole(user)) {
    const role = user.admin_level || user.role;
    const deptNav = DEPARTMENT_NAVIGATION[role];
    if (deptNav) {
      return deptNav;
    }
    // Fallback: only dashboard + search
    return [
      { path: '/admin', label: 'Dashboard', icon: 'Home' },
      { path: '/admin/search', label: 'Search', icon: 'Search' }
    ];
  }

  const allItems = [
    { path: '/admin', label: 'Dashboard', icon: 'Home' },
    { path: '/admin/users', label: 'User Management', icon: 'Users' },
    { path: '/admin/projects', label: 'Projects', icon: 'FolderKanban' },
    { path: '/admin/applications', label: 'Applications', icon: 'ClipboardList' },
    { path: '/admin/content', label: 'Blog Management', icon: 'Briefcase' },
    { path: '/admin/personnel', label: 'Personnel Management', icon: 'Users' },
    { path: '/admin/billing', label: 'Financial Hub', icon: 'Calculator' },
    { path: '/admin/mpesa', label: 'M-Pesa Payments', icon: 'Smartphone' },
    { path: '/admin/reports', label: 'Reports', icon: 'FileText' },
    { path: '/admin/departments', label: 'Departments', icon: 'Building2' },
    { path: '/admin/settings', label: 'Settings', icon: 'ShieldCheck' }
  ];

  if (!isAdmin(user)) return [{ path: '/admin', label: 'Dashboard', icon: 'Home' }];

  const rolePerms = getRolePermissions(user);
  if (!rolePerms) return allItems; // no saved matrix yet — full access

  // Dashboard is always visible; everything else requires its mapped permission.
  return allItems.filter(item =>
    item.path === '/admin' || rolePerms.includes(NAV_PERMISSION_MAP[item.path])
  );
}
