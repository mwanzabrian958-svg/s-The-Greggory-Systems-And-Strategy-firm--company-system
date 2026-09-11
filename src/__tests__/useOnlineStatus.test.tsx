import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { act } from 'react';

import { useOnlineStatus } from '../hooks/useOnlineStatus';

function OnlineHarness() {
  const isOnline = useOnlineStatus();
  return <span data-testid="status">{isOnline ? 'online' : 'offline'}</span>;
}

describe('useOnlineStatus', () => {
  afterEach(() => {
    cleanup();
  });

  it('defaults to navigator.onLine', () => {
    render(<OnlineHarness />);
    expect(screen.getByTestId('status').textContent).toBe(
      window.navigator.onLine ? 'online' : 'offline',
    );
  });

  it('tracks offline/online window events', () => {
    render(<OnlineHarness />);

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(screen.getByTestId('status').textContent).toBe('offline');

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(screen.getByTestId('status').textContent).toBe('online');
  });
});
