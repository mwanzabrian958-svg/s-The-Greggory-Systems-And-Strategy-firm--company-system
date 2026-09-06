/**
 * Department UI Configurations Index
 * Central export point for all department UI configurations
 */

import WEBMASTER_UI_CONFIG from './webmaster-ui.config.js';
import FINANCE_UI_CONFIG from './finance-ui.config.js';
import IT_UI_CONFIG from './it-ui.config.js';
import HR_UI_CONFIG from './hr-ui.config.js';
import MARKETING_UI_CONFIG from './marketing-ui.config.js';
import PROJECT_MANAGEMENT_UI_CONFIG from './project-management-ui.config.js';

// Registry of all department configurations
export const DEPARTMENT_UI_CONFIGS = {
  webmaster: WEBMASTER_UI_CONFIG,
  finance: FINANCE_UI_CONFIG,
  it: IT_UI_CONFIG,
  hr: HR_UI_CONFIG,
  marketing: MARKETING_UI_CONFIG,
  project_management: PROJECT_MANAGEMENT_UI_CONFIG
};

// Helper: get config by role
export function getDepartmentConfig(role) {
  return DEPARTMENT_UI_CONFIGS[role] || null;
}

// Helper: get navigation items for a role
export function getDepartmentNavigation(role) {
  const config = getDepartmentConfig(role);
  if (!config) return [];
  
  return config.navigation.map(item => ({
    path: item.path,
    label: item.label,
    icon: item.icon,
    category: item.category,
    visible: item.visible
  }));
}

// Helper: get modules for a role
export function getDepartmentModules(role) {
  const config = getDepartmentConfig(role);
  if (!config) return [];
  
  return config.modules;
}

// Helper: get all departments (for cross-reference)
export function getAllDepartments() {
  return Object.values(DEPARTMENT_UI_CONFIGS).map(config => ({
    role: config.role,
    label: config.label,
    description: config.description
  }));
}

// Summary of what was moved FROM Web Master to each department
export const WEBMASTER_ITEMS_REDISTRIBUTED = {
  'IT Department': [
    'User Management',
    'System Settings',
    'Activity Logs',
    'Data Safety',
    'Applications',
    'Permissions Manager'
  ],
  'Accounting & Finance': [
    'Financial Hub',
    'M-Pesa Payments',
    'Reports'
  ],
  'Human Resources': [
    'Personnel Management',
    'Team Management'
  ],
  'Marketing & Communications': [
    'Message Center'
  ],
  'Project Management': [
    'Projects'
  ],
  'Shared Utility': [
    'Search'
  ]
};

export default {
  DEPARTMENT_UI_CONFIGS,
  WEBMASTER_UI_CONFIG,
  FINANCE_UI_CONFIG,
  IT_UI_CONFIG,
  HR_UI_CONFIG,
  MARKETING_UI_CONFIG,
  PROJECT_MANAGEMENT_UI_CONFIG
};