/**
 * IT Department UI Configuration
 * Defines the navigation and modules for the IT team
 */

export const IT_UI_CONFIG = {
  role: 'it',
  label: 'IT Department',
  description: 'System administration, user management, and infrastructure',
  primaryColor: '#002D62', // Brand navy
  
  // Core navigation items - all IT-related modules
  navigation: [
    { 
      path: '/admin/users',
      label: 'User Management',
      icon: 'Users',
      category: 'administration',
      visible: true
    },
    {
      path: '/admin/settings',
      label: 'System Settings',
      icon: 'ShieldCheck',
      category: 'administration',
      visible: true
    },
    {
      path: '/admin/permissions',
      label: 'Permissions Manager',
      icon: 'Shield',
      category: 'security',
      visible: true
    },
    {
      path: '/admin/activity',
      label: 'Activity Logs',
      icon: 'Activity',
      category: 'security',
      visible: true
    },
    {
      path: '/admin/data-safety',
      label: 'Data Safety',
      icon: 'Lock',
      category: 'security',
      visible: true
    },
    {
      path: '/admin/applications',
      label: 'Applications',
      icon: 'ClipboardList',
      category: 'infrastructure',
      visible: true
    }
  ],

  // Modules this department owns
  modules: [
    {
      id: 'user-management',
      name: 'User Management',
      path: '/admin/users',
      description: 'Create, edit, and manage client and admin accounts',
      icon: 'Users',
      category: 'administration'
    },
    {
      id: 'system-settings',
      name: 'System Settings',
      path: '/admin/settings',
      description: 'Configure system-wide settings, roles, and integrations',
      icon: 'ShieldCheck',
      category: 'administration'
    },
    {
      id: 'permissions-manager',
      name: 'Permissions Manager',
      path: '/admin/permissions',
      description: 'Manage role-based access control and permissions',
      icon: 'Shield',
      category: 'security'
    },
    {
      id: 'activity-logs',
      name: 'Activity Logs',
      path: '/admin/activity',
      description: 'Monitor system activity and user actions',
      icon: 'Activity',
      category: 'security'
    },
    {
      id: 'data-safety',
      name: 'Data Safety',
      path: '/admin/data-safety',
      description: 'Backup management, security monitoring, and data protection',
      icon: 'Lock',
      category: 'security'
    },
    {
      id: 'applications',
      name: 'Applications',
      path: '/admin/applications',
      description: 'Manage system applications and integrations',
      icon: 'ClipboardList',
      category: 'infrastructure'
    }
  ],

  // Dashboard widgets for IT team
  dashboardWidgets: [
    {
      id: 'system-status',
      title: 'System Status',
      component: 'SystemStatusWidget',
      visible: true
    },
    {
      id: 'user-count',
      title: 'Active Users',
      component: 'UserCountWidget',
      visible: true
    },
    {
      id: 'security-alerts',
      title: 'Security Alerts',
      component: 'SecurityAlertsWidget',
      visible: true
    },
    {
      id: 'backup-status',
      title: 'Backup Status',
      component: 'BackupStatusWidget',
      visible: true
    }
  ],

  // Permissions for IT role
  permissions: [
    'view_users',
    'create_users',
    'edit_users',
    'delete_users',
    'view_settings',
    'edit_settings',
    'view_security',
    'audit_logs',
    'view_database',
    'manage_backups',
    'access_api_docs'
  ],

  // Items moved FROM other departments
  acquiredItems: [
    {
      name: 'User Management',
      path: '/admin/users',
      movedFrom: 'Web Master',
      reason: 'User account lifecycle management'
    },
    {
      name: 'Settings',
      path: '/admin/settings',
      movedFrom: 'Web Master',
      reason: 'System configuration and security settings'
    },
    {
      name: 'Activity Logs',
      path: '/admin/activity',
      movedFrom: 'Web Master',
      reason: 'Security auditing and compliance monitoring'
    },
    {
      name: 'Data Safety',
      path: '/admin/data-safety',
      movedFrom: 'Web Master',
      reason: 'Data protection and backup management'
    },
    {
      name: 'Applications',
      path: '/admin/applications',
      movedFrom: 'Web Master',
      reason: 'Application and infrastructure management'
    },
    {
      name: 'Permissions Manager',
      path: '/admin/permissions',
      movedFrom: 'Web Master',
      reason: 'Role-based access control management'
    }
  ]
};

export default IT_UI_CONFIG;