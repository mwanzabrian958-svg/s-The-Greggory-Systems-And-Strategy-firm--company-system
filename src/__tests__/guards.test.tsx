// @ts-nocheck
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

vi.mock('../services/socket', () => ({
  connectSocket: vi.fn(),
  disconnectSocket: vi.fn(),
}));

import { AuthProvider } from '../context/AuthContext';
import PrivateRoute from '../components/PrivateRoute';
import RoleRoute from '../components/RoleRoute';

const USER_KEY = 'tgf_user';

function renderAt(path: string, element: React.ReactNode) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Routes>
          <Route path="/secret" element={element} />
          <Route path="/login" element={<p>login page</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('PrivateRoute', () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('redirects anonymous users to /login', () => {
    renderAt(
      '/secret',
      <PrivateRoute>
        <p>secret content</p>
      </PrivateRoute>,
    );
    expect(screen.getByText('login page')).toBeInTheDocument();
    expect(screen.queryByText('secret content')).not.toBeInTheDocument();
  });

  it('redirects when a profile exists without a token', () => {
    localStorage.setItem(USER_KEY, JSON.stringify({ id: 1, name: 'No Token' }));
    renderAt(
      '/secret',
      <PrivateRoute>
        <p>secret content</p>
      </PrivateRoute>,
    );
    expect(screen.getByText('login page')).toBeInTheDocument();
  });

  it('renders children for an authenticated session', () => {
    localStorage.setItem(USER_KEY, JSON.stringify({ id: 1, name: 'Brian', token: 'tok' }));
    renderAt(
      '/secret',
      <PrivateRoute>
        <p>secret content</p>
      </PrivateRoute>,
    );
    expect(screen.getByText('secret content')).toBeInTheDocument();
  });
});

describe('RoleRoute', () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  const guarded = (roles: string[]) => (
    <RoleRoute allowedRoles={roles}>
      <p>admin content</p>
    </RoleRoute>
  );

  it('redirects anonymous users to /login', () => {
    renderAt('/secret', guarded(['admin']));
    expect(screen.getByText('login page')).toBeInTheDocument();
  });

  it('renders children when the role is allowed', () => {
    localStorage.setItem(USER_KEY, JSON.stringify({ id: 1, role: 'admin', token: 'tok' }));
    renderAt('/secret', guarded(['admin']));
    expect(screen.getByText('admin content')).toBeInTheDocument();
  });

  it('redirects when the role is not allowed', () => {
    localStorage.setItem(USER_KEY, JSON.stringify({ id: 2, role: 'user', token: 'tok' }));
    renderAt('/secret', guarded(['admin']));
    expect(screen.getByText('login page')).toBeInTheDocument();
  });

  it('renders children when no roles are required', () => {
    localStorage.setItem(USER_KEY, JSON.stringify({ id: 3, role: 'user', token: 'tok' }));
    renderAt('/secret', guarded([]));
    expect(screen.getByText('admin content')).toBeInTheDocument();
  });
});
