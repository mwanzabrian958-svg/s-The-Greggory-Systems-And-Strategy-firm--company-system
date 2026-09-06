/**
 * Project Management UI Configuration
 * Defines the navigation and modules for the Project Management team
 */

export const PROJECT_MANAGEMENT_UI_CONFIG = {
  role: 'project_management',
  label: 'Project Management',
  description: 'Project oversight, task coordination, and client project delivery',
  primaryColor: '#002D62', // Brand navy
  
  // Core navigation items - all project-related modules
  navigation: [
    { 
      path: '/admin/projects',
      label: 'Projects',
      icon: 'FolderKanban',
      category: 'projects',
      visible: true
    },
    {
      path: '/admin/projects/tasks',
      label: 'Project Tasks',
      icon: 'CheckSquare',
      category: 'projects',
      visible: true
    }
  ],

  // Modules this department owns
  modules: [
    {
      id: 'project-management',
      name: 'Project Management',
      path: '/admin/projects',
      description: 'Oversee client projects, track progress, and manage deliverables',
      icon: 'FolderKanban',
      category: 'projects'
    },
    {
      id: 'project-tasks',
      name: 'Project Tasks',
      path: '/admin/projects/tasks',
      description: 'Manage task assignments, deadlines, and project workflows',
      icon: 'CheckSquare',
      category: 'projects'
    }
  ],

  // Dashboard widgets for Project Management team
  dashboardWidgets: [
    {
      id: 'project-status',
      title: 'Project Status',
      component: 'ProjectStatusWidget',
      visible: true
    },
    {
      id: 'task-completion',
      title: 'Task Completion',
      component: 'TaskCompletionWidget',
      visible: true
    },
    {
      id: 'upcoming-deadlines',
      title: 'Upcoming Deadlines',
      component: 'UpcomingDeadlinesWidget',
      visible: true
    }
  ],

  // Permissions for Project Management role
  permissions: [
    'view_projects',
    'create_projects',
    'edit_projects',
    'delete_projects',
    'view_tasks'
  ],

  // Items moved FROM other departments
  acquiredItems: [
    {
      name: 'Projects',
      path: '/admin/projects',
      movedFrom: 'Web Master',
      reason: 'Project delivery and client project management'
    }
  ]
};

export default PROJECT_MANAGEMENT_UI_CONFIG;