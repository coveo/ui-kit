import dayjs from 'dayjs';
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {loadDayjsLocale} from './dayjs-locales';

vi.mock('dayjs', () => ({
  __esModule: true,
  default: {locale: vi.fn()},
}));

vi.mock('@/src/generated/dayjs-locales-data', () => {
  const mockLocales = {
    en: vi.fn(() => Promise.resolve()),
    fr: vi.fn(() => Promise.resolve()),
    'en-US': vi.fn(() => Promise.resolve()),
  };
  return {
    locales: mockLocales,
    __getMockLocales: () => mockLocales,
  };
});

describe('#loadDayjsLocale', () => {
  let mockLocales: Record<string, ReturnType<typeof vi.fn>>;
  let originalWarn: typeof console.warn;

  beforeAll(async () => {
    // Dynamically import the getter after mocks are set up
    const localesData = await import('../generated/dayjs-locales-data');
    mockLocales = (
      localesData as unknown as {
        __getMockLocales: () => Record<string, ReturnType<typeof vi.fn>>;
      }
    ).__getMockLocales();
    originalWarn = console.warn;
  });

  beforeEach(() => {
    vi.useFakeTimers();
    Object.values(mockLocales).forEach((fn) => fn.mockReset?.());
    console.warn = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    console.warn = originalWarn;
  });

  it('should load the exact locale when available', async () => {
    loadDayjsLocale('en-US');
    await vi.runAllTimersAsync();

    expect(dayjs.locale).toHaveBeenCalledWith('en-US');
  });

  it('should fall back to regionless language when region is not available', async () => {
    loadDayjsLocale('en-CA');
    await vi.runAllTimersAsync();

    expect(dayjs.locale).toHaveBeenCalledWith('en');
  });

  it('should warn when locale is not available', () => {
    loadDayjsLocale('de');

    expect(console.warn).toHaveBeenCalledWith(
      'Cannot load dayjs locale file for "de"'
    );
  });

  it('should handle errors thrown by locale loader', () => {
    mockLocales.fr.mockImplementationOnce(() => {
      throw new Error('fail');
    });
    loadDayjsLocale('fr');

    expect(console.warn).toHaveBeenCalledWith(
      'Cannot load dayjs locale file for "fr"'
    );
  });
});
