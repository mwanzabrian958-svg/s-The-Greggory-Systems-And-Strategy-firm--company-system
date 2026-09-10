import { describe, it, expect } from 'vitest';

import {
  ROLES,
  PERMISSIONS,
  isAdmin,
  isSuperAdmin,
  isDepartmentRole,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getNavigationItems,
} from '../admin/utils/permissions';

describe('Permissions (RBAC)', () => {
  const user = (role: string) => ({ role, admin_level: role });

  it('rejects null / undefined users', () => {
    expect(isAdmin(null)).toBe(false);
    expect(isSuperAdmin(undefined)).toBe(false);
    expect(hasPermission(null, PERMISSIONS.VIEW_USERS)).toBe(false);
    expect(hasAnyPermission(null, [PERMISSIONS.VIEW_USERS])).toBe(false);
  });

  it('super admins bypass permission checks', () => {
    const u = user(ROLES.SUPER_ADMIN);
    expect(isSuperAdmin(u)).toBe(true);
    expect(isDepartmentRole(u)).toBe(false);
    expect(hasPermission(u, PERMISSIONS.MANAGE_ADMINS)).toBe(true);
    expect(hasPermission(u, PERMISSIONS.VIEW_FINANCIAL)).toBe(true);
    expect(hasPermission(u, PERMISSIONS.VIEW_DATA_SAFETY)).toBe(true);
  });

  it('finance role can view financial data but NOT manage team or users', () => {
    const finance = user(ROLES.FINANCE);
    expect(isDepartmentRole(finance)).toBe(true);
    expect(hasPermission(finance, PERMISSIONS.VIEW_FINANCIAL)).toBe(true);
    expect(hasPermission(finance, PERMISSIONS.MANAGE_FINANCIAL)).toBe(true);
    expect(hasPermission(finance, PERMISSIONS.MANAGE_TEAM)).toBe(false);
    expect(hasPermission(finance, PERMISSIONS.VIEW_USERS)).toBe(false);
    expect(hasPermission(finance, PERMISSIONS.VIEW_SETTINGS)).toBe(false);
  });

  it('HR role can manage the team but cannot see financial data', () => {
    const hr = user(ROLES.HR);
    expect(hasPermission(hr, PERMISSIONS.MANAGE_TEAM)).toBe(true);
    expect(hasPermission(hr, PERMISSIONS.VIEW_FINANCIAL)).toBe(false);
    expect(hasPermission(hr, PERMISSIONS.MANAGE_FINANCIAL)).toBe(false);
  });

  it('IT role can view settings/activity logs but not financial', () => {
    const it = user(ROLES.IT);
    expect(hasPermission(it, PERMISSIONS.VIEW_USERS)).toBe(true);
    expect(hasPermission(it, PERMISSIONS.VIEW_SETTINGS)).toBe(true);
    expect(hasPermission(it, PERMISSIONS.VIEW_ACTIVITY_LOGS)).toBe(true);
    expect(hasPermission(it, PERMISSIONS.VIEW_FINANCIAL)).toBe(false);
  });

  it('project-management role sees projects only', () => {
    const pm = user(ROLES.PROJECT_MANAGEMENT);
    expect(hasPermission(pm, PERMISSIONS.VIEW_PROJECTS)).toBe(true);
    expect(hasPermission(pm, PERMISSIONS.VIEW_FINANCIAL)).toBe(false);
    expect(hasPermission(pm, PERMISSIONS.MANAGE_TEAM)).toBe(false);
  });

  it('hasAllPermissions requires every permission', () => {
    const it = user(ROLES.IT);
    expect(hasAllPermissions(it, [PERMISSIONS.VIEW_USERS, PERMISSIONS.VIEW_SETTINGS])).toBe(true);
    expect(hasAllPermissions(it, [PERMISSIONS.VIEW_USERS, PERMISSIONS.VIEW_FINANCIAL])).toBe(false);
  });

  it('department roles get department-scoped navigation (no /admin/users for finance)', () => {
    const financeNav = getNavigationItems(user(ROLES.FINANCE));
    const paths = financeNav.map((n) => n.path);
    expect(paths).not.toContain('/admin/users');
    expect(paths).toContain('/admin/billing');
    expect(paths).toContain('/admin/mpesa');
  });

  it('non-admin users get only their dashboard', () => {
    const nav = getNavigationItems(user(ROLES.USER));
    expect(nav).toEqual([{ path: '/admin', label: 'Dashboard', icon: 'Home' }]);
  });
});
