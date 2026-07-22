import {render, screen} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import App from './App.js';

vi.mock('./context/engine.js', () => ({
  EngineProvider: ({children}: {children: React.ReactNode}) => <>{children}</>,
  useEngine: () => ({}),
}));

vi.mock('./context/generative-interface.js', () => ({
  GenerativeInterfaceProvider: ({children}: {children: React.ReactNode}) => (
    <>{children}</>
  ),
  useGenerativeInterface: () => ({}),
}));

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText('Generative Experience Demo')).toBeDefined();
  });
});
