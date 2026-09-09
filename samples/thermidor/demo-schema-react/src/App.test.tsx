import {render, screen} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import App from './App.js';

vi.mock('./context/engine.js', () => ({
  EngineProvider: ({children}: {children: React.ReactNode}) => <>{children}</>,
  useEngine: () => ({}),
}));

vi.mock('./context/generative-interface.js', () => ({
  GenerativeInterfaceProvider: ({children}: {children: React.ReactNode}) => <>{children}</>,
  useGenerativeInterface: () => ({}),
}));

vi.mock('./components/AppShell.js', () => ({
  AppShell: () => <div data-testid="app-shell">AppShell</div>,
}));

vi.mock('./components/StorefrontPreview/StorefrontPreviewPage.js', () => ({
  StorefrontPreviewPage: () => <div data-testid="storefront-preview">Storefront Preview</div>,
}));

describe('App', () => {
  it('redirects directly to the storefront preview', async () => {
    render(<App />);
    expect(await screen.findByTestId('storefront-preview')).toBeDefined();
  });
});
