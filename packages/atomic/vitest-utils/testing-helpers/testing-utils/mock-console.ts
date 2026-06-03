import {vi} from 'vitest';

export function mockConsole(options: {loud?: boolean} = {}) {
  const mockedError = vi.spyOn(console, 'error');
  const mockedLog = vi.spyOn(console, 'log');
  const mockedWarn = vi.spyOn(console, 'warn');

  if (!options.loud) {
    mockedError.mockImplementation(() => {});
    mockedLog.mockImplementation(() => {});
    mockedWarn.mockImplementation(() => {});
  }

  return vi.mocked(console);
}
