// @ts-nocheck
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';

const { mockApiCall } = vi.hoisted(() => ({ mockApiCall: vi.fn() }));

vi.mock('../services/api', () => ({
  apiCall: (...args: unknown[]) => mockApiCall(...args),
  getApiUrl: (p: string) => `http://127.0.0.1:3001/api${p}`,
}));

vi.mock('../services/socket', () => ({
  connectSocket: vi.fn(),
  disconnectSocket: vi.fn(),
}));

import '../i18n';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import SearchBlock from '../components/SearchBlock';
import Footer from '../components/Footer';
import { SITE_NAME } from '../constants/siteBrand';

function LocationProbe() {
  const loc = useLocation();
  return (
    <div data-testid="loc">
      {loc.pathname}
      {loc.search}
    </div>
  );
}

describe('Navbar', () => {
  beforeEach(() => {
    localStorage.clear();
    mockApiCall.mockReset();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  function renderNav() {
    return render(
      <MemoryRouter>
        <AuthProvider>
          <Navbar />
        </AuthProvider>
      </MemoryRouter>,
    );
  }

  it('shows the Client Access entry for anonymous visitors', () => {
    renderNav();
    expect(screen.getByText('Client Access')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('shows the logged-in user instead of Client Access', () => {
    localStorage.setItem(
      'tgf_user',
      JSON.stringify({ id: 7, name: 'Brian M', display_name: 'Brian M', token: 'tok' }),
    );
    renderNav();
    expect(screen.getByText('Brian M')).toBeInTheDocument();
    expect(screen.queryByText('Client Access')).not.toBeInTheDocument();
  });
});

describe('SearchBlock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockApiCall.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  function renderSearch() {
    return render(
      <MemoryRouter>
        <ThemeProvider>
          <SearchBlock />
          <LocationProbe />
        </ThemeProvider>
      </MemoryRouter>,
    );
  }

  async function typeQuery(text: string) {
    fireEvent.change(screen.getByPlaceholderText(/Query system database/i), {
      target: { value: text },
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
  }

  it('does not query for input shorter than minChars', async () => {
    renderSearch();
    await typeQuery('a');
    expect(mockApiCall).not.toHaveBeenCalled();
  });

  it('fetches and shows suggestions, then navigates on Enter', async () => {
    mockApiCall.mockResolvedValue({
      success: true,
      results: [
        { type: 'user', id: 1, title: 'John Doe', subtitle: 'Client', link: '/admin/users/1' },
      ],
    });
    renderSearch();
    await typeQuery('john');
    expect(mockApiCall).toHaveBeenCalledWith(expect.stringContaining('q=john'));
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    fireEvent.keyDown(screen.getByPlaceholderText(/Query system database/i), { key: 'Enter' });
    expect(screen.getByTestId('loc').textContent).toContain('/admin/search');
    expect(screen.getByTestId('loc').textContent).toContain('q=john');
  });

  it('shows the server error message when search fails', async () => {
    mockApiCall.mockResolvedValue({ success: false, message: 'Down for maintenance' });
    renderSearch();
    await typeQuery('john');
    expect(screen.getByText('Down for maintenance')).toBeInTheDocument();
  });
});

describe('Footer', () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('renders brand, year and legal links', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Footer />
        </AuthProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText(SITE_NAME)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(String(new Date().getFullYear())))).toBeInTheDocument();
    expect(screen.getByText('Privacy Protocol')).toBeInTheDocument();
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
  });
});
