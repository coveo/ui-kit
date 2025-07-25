import {render} from '@testing-library/react';
import {beforeEach, expect, type MockInstance, test, vi} from 'vitest';
import App from './App.js';

let errorSpy: MockInstance<{
  (...data: unknown[]): void;
  (message?: unknown, ...optionalParams: unknown[]): void;
}>;

beforeEach(() => {
  errorSpy = vi.spyOn(globalThis.console, 'error');
});

test('renders without error', async () => {
  render(<App />);

  expect(errorSpy).not.toHaveBeenCalled();
});
