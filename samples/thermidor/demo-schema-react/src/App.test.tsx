import {render, screen} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import App from './App.js';

vi.mock('./context/session.js', () => ({
  SessionProvider: ({children}: {children: React.ReactNode}) => <>{children}</>,
  useSession: () => ({}),
}));

vi.mock('./components/AppShell.js', () => ({
  AppShell: () => <div data-testid="app-shell">AppShell</div>,
}));

describe('App', () => {
  it('renders AppShell inside providers', () => {
    render(<App />);
    expect(screen.getByTestId('app-shell')).toBeDefined();
  });
});
