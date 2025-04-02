import {render} from '@testing-library/react';
import {vi, MockInstance} from 'vitest';
import App from './App.js';

let errorSpy: MockInstance<{
  (...data: unknown[]): void;
  (message?: unknown, ...optionalParams: unknown[]): void;
}>;

beforeEach(() => {
  errorSpy = vi.spyOn(global.console, 'error');
});

test('renders without error', async () => {
  render(<App />);

  expect(errorSpy).not.toHaveBeenCalled();
});
