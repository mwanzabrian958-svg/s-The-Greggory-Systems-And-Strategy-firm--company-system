/**
 * Marketing & Communications UI Configuration
 * Defines the navigation and modules for the Marketing team
 */

export const MARKETING_UI_CONFIG = {
  role: 'marketing',
  label: 'Marketing & Communications',
  description: 'Brand management, client communication, and marketing analytics',
  primaryColor: '#002D62', // Brand navy
  
  // Core navigation items - all marketing-related modules
  navigation: [
    { 
      path: '/admin/messages',
      label: 'Message Center',
      icon: 'MessageSquare',
      category: 'communications',
      visible: true
    },
    {
      path: '/admin/reports',
      label: 'Analytics & Reports',
      icon: 'BarChart3',
      category: 'analytics',
      visible: true
    },
    {
      path: '/admin/applications',
      label: 'Applications',
      icon: 'ClipboardList',
      category: 'communications',
      visible: true
    }
  ],

  // Modules this department owns
  modules: [
    {
      id: 'message-center',
      name: 'Message Center',
      path: '/admin/messages',
      description: 'Manage client communications and inbound messages',
      icon: 'MessageSquare',
      category: 'communications'
    },
    {
      id: 'analytics-reports',
      name: 'Analytics & Reports',
      path: '/admin/reports',
      description: 'Marketing analytics and business intelligence reports',
      icon: 'BarChart3',
      category: 'analytics'
    },
    {
      id: 'applications',
      name: 'Applications',
      path: '/admin/applications',
      description: 'Track and manage client applications',
      icon: 'ClipboardList',
      category: 'communications'
    }
  ],

  // Dashboard widgets for Marketing team
  dashboardWidgets: [
    {
      id: 'client-engagement',
      title: 'Client Engagement',
      component: 'ClientEngagementWidget',
      visible: true
    },
    {
      id: 'campaign-performance',
      title: 'Campaign Performance',
      component: 'CampaignPerformanceWidget',
      visible: true
    },
    {
      id: 'message-insights',
      title: 'Message Insights',
      component: 'MessageInsightsWidget',
      visible: true
    }
  ],

  // Permissions for Marketing role
  permissions: [
    'view_communication',
    'send_messages',
    'view_reports',
    'view_applications'
  ],

  // Items moved FROM other departments
  acquiredItems: [
    {
      name: 'Message Center',
      path: '/admin/messages',
      movedFrom: 'Web Master',
      reason: 'Client communication and marketing correspondence'
    },
    {
      name: 'Analytics & Reports',
      path: '/admin/reports',
      movedFrom: 'Web Master',
      reason: 'Business intelligence and marketing analytics'
    }
  ]
};

export default MARKETING_UI_CONFIG;