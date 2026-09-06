/**
 * Accounting & Finance UI Configuration
 * Defines the navigation and modules for the Finance team
 * Now includes M-Pesa Send Money payment recording
 */

export const FINANCE_UI_CONFIG = {
  role: 'finance',
  label: 'Accounting & Finance',
  description: 'Financial operations, billing, and payment processing',
  primaryColor: '#002D62', // Brand navy
  
  // Core navigation items - all finance-related modules
  navigation: [
    { 
      path: '/admin/billing',
      label: 'Financial Hub',
      icon: 'Calculator',
      category: 'finance',
      visible: true
    },
    {
      path: '/admin/mpesa',
      label: 'M-Pesa Payments',
      icon: 'Smartphone',
      category: 'finance',
      visible: true
    },
    {
      path: '/admin/invoices/list',
      label: 'Invoices',
      icon: 'FileText',
      category: 'finance',
      visible: true
    },
    {
      path: '/admin/invoices/create',
      label: 'Create Invoice',
      icon: 'Plus',
      category: 'finance',
      visible: true
    },
    {
      path: '/admin/billing/entry',
      label: 'Ledger Entry',
      icon: 'BookOpen',
      category: 'finance',
      visible: true
    },
    {
      path: '/admin/reports',
      label: 'Financial Reports',
      icon: 'BarChart3',
      category: 'finance',
      visible: true
    }
  ],

  // Modules this department owns
  modules: [
    {
      id: 'financial-hub',
      name: 'Financial Hub',
      path: '/admin/billing',
      description: 'Manage client billing, pricing tiers, and payment plans',
      icon: 'Calculator',
      category: 'finance'
    },
    {
      id: 'mpesa-payments',
      name: 'M-Pesa Payments',
      path: '/admin/mpesa',
      description: 'Record M-Pesa Send Money payments and reconcile transactions',
      icon: 'Smartphone',
      category: 'finance'
    },
    {
      id: 'invoice-management',
      name: 'Invoice Management',
      path: '/admin/invoices',
      description: 'Create, send, and track invoices',
      icon: 'FileText',
      category: 'finance'
    },
    {
      id: 'ledger-entries',
      name: 'Ledger Entries',
      path: '/admin/billing/entry',
      description: 'Manual accounting entries and expense tracking',
      icon: 'BookOpen',
      category: 'finance'
    },
    {
      id: 'financial-reports',
      name: 'Financial Reports',
      path: '/admin/reports',
      description: 'P&L statements, revenue tracking, and financial analytics',
      icon: 'BarChart3',
      category: 'finance'
    }
  ],

  // M-Pesa Send Money specific features
  mpesaFeatures: {
    enabled: true,
    features: [
      {
        id: 'record-payment',
        name: 'Record Send Money Payment',
        description: 'Log M-Pesa payments received via Send Money',
        path: '/admin/mpesa/send-money/new'
      },
      {
        id: 'track-transactions',
        name: 'Transaction Tracking',
        description: 'View and reconcile all M-Pesa Send Money transactions',
        path: '/admin/mpesa/send-money'
      },
      {
        id: 'client-linking',
        name: 'Link to Clients',
        description: 'Associate payments with specific clients and invoices',
        enabled: true
      },
      {
        id: 'project-linking',
        name: 'Link to Projects',
        description: 'Associate payments with specific projects',
        enabled: true
      },
      {
        id: 'invoice-linking',
        name: 'Link to Invoices',
        description: 'Mark invoices as paid via M-Pesa Send Money',
        enabled: true
      },
      {
        id: 'company-linking',
        name: 'Link to Company',
        description: 'Associate payments with company entities',
        enabled: true
      }
    ]
  },

  // Dashboard widgets for Finance team
  dashboardWidgets: [
    {
      id: 'revenue-stats',
      title: 'Revenue Overview',
      component: 'RevenueStatsWidget',
      visible: true
    },
    {
      id: 'pending-payments',
      title: 'Pending Payments',
      component: 'PendingPaymentsWidget',
      visible: true
    },
    {
      id: 'mpesa-ledger',
      title: 'M-Pesa Transactions',
      component: 'MpesaTransactionWidget',
      visible: true
    },
    {
      id: 'cash-flow',
      title: 'Cash Flow',
      component: 'CashFlowWidget',
      visible: true
    }
  ],

  // Permissions for Finance role
  permissions: [
    'view_financial',
    'manage_financial',
    'create_invoice',
    'send_invoice',
    'manage_payments',
    'view_reports'
  ],

  // Items moved FROM other departments
  acquiredItems: [
    {
      name: 'Financial Hub',
      path: '/admin/billing',
      movedFrom: 'Web Master',
      reason: 'Financial operations management'
    },
    {
      name: 'M-Pesa Payments',
      path: '/admin/mpesa',
      movedFrom: 'Web Master',
      reason: 'Payment processing responsibility'
    },
    {
      name: 'Reports',
      path: '/admin/reports',
      movedFrom: 'Web Master',
      reason: 'Financial reporting and analytics'
    }
  ]
};

export default FINANCE_UI_CONFIG;