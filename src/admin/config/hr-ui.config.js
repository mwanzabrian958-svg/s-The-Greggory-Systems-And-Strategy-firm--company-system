/**
 * Human Resources UI Configuration
 * Defines the navigation and modules for the HR team
 */

export const HR_UI_CONFIG = {
  role: 'hr',
  label: 'Human Resources',
  description: 'Personnel management and team coordination',
  primaryColor: '#002D62', // Brand navy
  
  // Core navigation items - all HR-related modules
  navigation: [
    { 
      path: '/admin/personnel',
      label: 'Personnel Management',
      icon: 'Users',
      category: 'hr',
      visible: true
    },
    {
      path: '/admin/team',
      label: 'Team Management',
      icon: 'UserCheck',
      category: 'hr',
      visible: true
    },
    {
      path: '/admin/applications',
      label: 'Applications',
      icon: 'ClipboardList',
      category: 'hr',
      visible: true
    }
  ],

  // Modules this department owns
  modules: [
    {
      id: 'personnel-management',
      name: 'Personnel Management',
      path: '/admin/personnel',
      description: 'Manage employee records, personnel profiles, and staff information',
      icon: 'Users',
      category: 'hr'
    },
    {
      id: 'team-management',
      name: 'Team Management',
      path: '/admin/team',
      description: 'Organize teams, assign roles, and manage team structures',
      icon: 'UserCheck',
      category: 'hr'
    },
    {
      id: 'job-applications',
      name: 'Applications',
      path: '/admin/applications',
      description: 'Review job applications and candidate information',
      icon: 'ClipboardList',
      category: 'hr'
    }
  ],

  // Dashboard widgets for HR team
  dashboardWidgets: [
    {
      id: 'headcount',
      title: 'Team Headcount',
      component: 'HeadcountWidget',
      visible: true
    },
    {
      id: 'open-positions',
      title: 'Open Positions',
      component: 'OpenPositionsWidget',
      visible: true
    },
    {
      id: 'recent-hires',
      title: 'Recent Hires',
      component: 'RecentHiresWidget',
      visible: true
    }
  ],

  // Permissions for HR role
  permissions: [
    'view_personnel',
    'manage_team',
    'view_applications'
  ],

  // Items moved FROM other departments
  acquiredItems: [
    {
      name: 'Personnel Management',
      path: '/admin/personnel',
      movedFrom: 'Web Master',
      reason: 'Employee lifecycle and personnel records management'
    },
    {
      name: 'Team Management',
      path: '/admin/team',
      movedFrom: 'Web Master',
      reason: 'Team structure and org management'
    }
  ]
};

export default HR_UI_CONFIG;