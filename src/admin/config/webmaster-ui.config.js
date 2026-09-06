/**
 * Web Master UI Configuration
 * Defines the navigation and modules visible to the Web Master role
 * ONLY contains web-related responsibilities
 */

export const WEBMASTER_UI_CONFIG = {
  role: 'webmaster',
  label: 'Web Master',
  description: 'Website content and media management',
  primaryColor: '#002D62', // Brand navy
  
  // Core navigation items - only web-related modules
  navigation: [
    { 
      path: '/admin', 
      label: 'Dashboard', 
      icon: 'Home',
      category: 'core',
      visible: true
    },
    { 
      path: '/admin/content', 
      label: 'Blog Management', 
      icon: 'Briefcase',
      category: 'web-content',
      visible: true
    },
    { 
      path: '/admin/media', 
      label: 'Media Library', 
      icon: 'Image',
      category: 'web-content',
      visible: true
    }
  ],

  // Modules that Web Master owns/uses
  modules: [
    {
      id: 'content-management',
      name: 'Content Management',
      path: '/admin/content',
      description: 'Manage blog posts, articles, and website content',
      icon: 'Edit',
      category: 'web-content'
    },
    {
      id: 'media-library',
      name: 'Media Library',
      path: '/admin/media',
      description: 'Upload, organize, and manage media assets',
      icon: 'Upload',
      category: 'web-content'
    }
  ],

  // Dashboard widgets specifically for Web Master
  dashboardWidgets: [
    {
      id: 'content-stats',
      title: 'Content Overview',
      component: 'ContentStatsWidget',
      visible: true
    },
    {
      id: 'media-usage',
      title: 'Media Storage',
      component: 'MediaUsageWidget',
      visible: true
    },
    {
      id: 'recent-content',
      title: 'Recent Content',
      component: 'RecentContentWidget',
      visible: true
    }
  ],

  // Permissions this role has (by default)
  permissions: [
    'view_content',
    'create_content',
    'edit_content',
    'delete_content',
    'manage_media'
  ],

  // Items REMOVED from Web Master (moved to other departments)
  removedItems: [
    {
      name: 'User Management',
      path: '/admin/users',
      movedTo: 'IT Department',
      reason: 'User account lifecycle is an IT responsibility'
    },
    {
      name: 'Projects',
      path: '/admin/projects',
      movedTo: 'Project Management',
      reason: 'Project oversight belongs to Project Management, not web content'
    },
    {
      name: 'Applications',
      path: '/admin/applications',
      movedTo: 'IT Operations',
      reason: 'Application management is infrastructure'
    },
    {
      name: 'Personnel Management',
      path: '/admin/personnel',
      movedTo: 'Human Resources',
      reason: 'People management is HR'
    },
    {
      name: 'Financial Hub',
      path: '/admin/billing',
      movedTo: 'Accounting & Finance',
      reason: 'Financial data and billing'
    },
    {
      name: 'M-Pesa Payments',
      path: '/admin/mpesa',
      movedTo: 'Accounting & Finance',
      reason: 'Payment processing is finance'
    },
    {
      name: 'Reports',
      path: '/admin/reports',
      movedTo: 'Marketing & Analytics',
      reason: 'Business intelligence reporting'
    },
    {
      name: 'Settings',
      path: '/admin/settings',
      movedTo: 'IT Department',
      reason: 'System configuration and security'
    },
    {
      name: 'Activity Logs',
      path: '/admin/activity',
      movedTo: 'IT Security & Compliance',
      reason: 'Security auditing'
    },
    {
      name: 'Team Management',
      path: '/admin/team',
      movedTo: 'Human Resources',
      reason: 'Team org structure is HR'
    },
    {
      name: 'Data Safety',
      path: '/admin/data-safety',
      movedTo: 'IT Security',
      reason: 'Data protection and backups'
    },
    {
      name: 'Messages',
      path: '/admin/messages',
      movedTo: 'Communications',
      reason: 'Client communication management'
    },
    {
      name: 'Permissions Manager',
      path: '/admin/permissions',
      movedTo: 'IT Department',
      reason: 'Role-based access control is IT'
    },
    {
      name: 'Search',
      path: '/admin/search',
      movedTo: 'Shared Utility',
      reason: 'Maintained as a shared search across departments'
    }
  ]
};

export default WEBMASTER_UI_CONFIG;