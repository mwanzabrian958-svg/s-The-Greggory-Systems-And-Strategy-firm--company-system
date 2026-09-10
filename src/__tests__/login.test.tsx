import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// vi.mock factories are hoisted — the mock fn must be created via vi.hoisted
// so it exists before the factory runs.
const { mockApiCall } = vi.hoisted(() => ({ mockApiCall: vi.fn() }));

vi.mock('../services/api', () => ({
  apiCall: (...args: any[]) => mockApiCall(...args),
}));

import SimpleLogin from '../admin/pages/SimpleLogin';

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <SimpleLogin />
    </BrowserRouter>,
  );
};

const ROLE_OPTIONS = ['System Administrator', 'Finance Manager'];

const expectRolesVisible = async () => {
  const roleButtons = await screen.findAllByText(/System Administrator|Finance Manager/);
  const roleNames = roleButtons.map((el) => el.textContent ?? '');
  for (const name of ROLE_OPTIONS) {
    expect(roleNames).toContain(name);
  }
  return roleButtons;
};

describe('SimpleLogin', () => {
  beforeEach(() => {
    // Fully reset mock behavior + history + any once-queues from previous tests.
    mockApiCall.mockReset();
    localStorage.clear();
    // Default implementation keyed by URL. The login endpoint is stubbed per-test.
    // Return extra roles from the API so the component's full list is rendered
    // (the admin role is always prepended client-side regardless).
    mockApiCall.mockImplementation((url: string) => {
      if (url === '/api/roles') {
        return Promise.resolve({
          roles: [{ slug: 'finance_manager', name: 'Finance Manager' }],
        });
      }
      return Promise.resolve({});
    });
  });

  afterEach(() => {
    cleanup();
  });

  async function selectAdminRole() {
    const adminBtn = await screen.findByText('System Administrator', undefined, { timeout: 3000 });
    fireEvent.click(adminBtn);
  }

  it('renders the login page with role selection', async () => {
    renderLogin();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    await expectRolesVisible();
  });

  it('shows admin role as first option', async () => {
    // API returns extra roles; component must still put admin first.
    mockApiCall.mockImplementation((url: string) => {
      if (url === '/api/roles') {
        return Promise.resolve({ roles: [{ slug: 'finance_manager', name: 'Finance Manager' }] });
      }
      return Promise.resolve({});
    });
    renderLogin();
    const roleButtons = await screen.findAllByText(
      /System Administrator|Finance Manager/,
      undefined,
      { timeout: 3000 },
    );
    const roleNames = roleButtons.map((el) => el.textContent ?? '');
    expect(roleNames[0]).toBe('System Administrator');
    expect(roleNames[1]).toBe('Finance Manager');
  });

  it('shows email/password fields after selecting a role', async () => {
    renderLogin();
    await selectAdminRole();
    expect(await screen.findByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  it('shows error message on failed login', async () => {
    mockApiCall.mockImplementation((url: string) => {
      if (url === '/api/roles') return Promise.resolve({ roles: [] });
      return Promise.reject(new Error('Invalid credentials'));
    });
    renderLogin();
    await selectAdminRole();
    fireEvent.change(await screen.findByPlaceholderText('Email'), {
      target: { value: 'admin@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));
    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
  });

  it('stores token in localStorage on successful login', async () => {
    mockApiCall.mockImplementation((url: string) => {
      if (url === '/api/roles') return Promise.resolve({ roles: [] });
      return Promise.resolve({ user: { id: 1, name: 'Admin' }, token: 'fake-jwt-token' });
    });
    renderLogin();
    await selectAdminRole();
    fireEvent.change(await screen.findByPlaceholderText('Email'), {
      target: { value: 'admin@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));
    await waitFor(
      () => {
        expect(localStorage.getItem('gf_admin_session_token')).toBe('fake-jwt-token');
      },
      { timeout: 3000 },
    );
  });
});
