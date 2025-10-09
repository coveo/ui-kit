import {vi} from 'vitest';

export function mockConsole(options: {silent?: boolean} = {}) {
  const errorSpy = vi.spyOn(console, 'error');
  const logSpy = vi.spyOn(console, 'log');
  const warnSpy = vi.spyOn(console, 'warn');

  if (options.silent) {
    errorSpy.mockImplementation(() => {});
    logSpy.mockImplementation(() => {});
    warnSpy.mockImplementation(() => {});
  }

  return vi.mocked(console);
}
