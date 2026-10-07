import dayjs from 'dayjs';
import {afterEach, beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';
import {loadDayjsLocale} from './dayjs-locales';

vi.mock('@/src/generated/dayjs-locales-data', () => {
  const mockLocales = {
    en: vi.fn(() => Promise.resolve()),
    fr: vi.fn(() => Promise.resolve()),
    'en-ca': vi.fn(() => Promise.resolve()),
    'sr-cyrl': vi.fn(() => Promise.resolve()),
    'zh-tw': vi.fn(() => Promise.resolve()),
  };
  return {
    locales: mockLocales,
    __getMockLocales: () => mockLocales,
  };
});

const flushPromises = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

describe('#loadDayjsLocale', () => {
  let mockLocales: Record<string, ReturnType<typeof vi.fn>>;
  let originalWarn: typeof console.warn;
  let localeSpy: ReturnType<typeof vi.spyOn>;

  beforeAll(async () => {
    const localesData = await import('../generated/dayjs-locales-data');
    mockLocales = (
      localesData as unknown as {
        __getMockLocales: () => Record<string, ReturnType<typeof vi.fn>>;
      }
    ).__getMockLocales();
    originalWarn = console.warn;
  });

  beforeEach(() => {
    localeSpy = vi.spyOn(dayjs, 'locale').mockImplementation(() => '');
    Object.values(mockLocales).forEach((fn) => fn.mockReset?.());
    console.warn = vi.fn();
  });

  afterEach(() => {
    localeSpy.mockRestore();
    console.warn = originalWarn;
  });

  it('should load the exact locale when available', async () => {
    loadDayjsLocale('en-CA');
    await flushPromises();

    expect(localeSpy).toHaveBeenCalledWith('en-ca');
  });

  it('should load the exact locale regardless of case', async () => {
    loadDayjsLocale('EN-ca');
    await flushPromises();

    expect(localeSpy).toHaveBeenCalledWith('en-ca');
  });

  it('should load the regional locale when the language also has a script', async () => {
    loadDayjsLocale('zh-Hant-TW');
    await flushPromises();

    expect(localeSpy).toHaveBeenCalledWith('zh-tw');
  });

  it('should load the script locale when the region is not available', async () => {
    loadDayjsLocale('sr-Cyrl-RS');
    await flushPromises();

    expect(localeSpy).toHaveBeenCalledWith('sr-cyrl');
  });

  it('should fall back to regionless language when region is not available', async () => {
    loadDayjsLocale('en-US');
    await flushPromises();

    expect(localeSpy).toHaveBeenCalledWith('en');
  });

  it('should warn when locale is not available', () => {
    loadDayjsLocale('de');

    expect(console.warn).toHaveBeenCalledWith('Cannot load dayjs locale file for "de"');
  });

  it('should handle errors thrown by locale loader', () => {
    mockLocales.fr.mockImplementationOnce(() => {
      throw new Error('fail');
    });
    loadDayjsLocale('fr');

    expect(console.warn).toHaveBeenCalledWith('Cannot load dayjs locale file for "fr"');
  });

  it('should warn when the locale loader rejects', async () => {
    mockLocales.fr.mockImplementationOnce(() => Promise.reject(new Error('fail')));
    loadDayjsLocale('fr');
    await flushPromises();

    expect(localeSpy).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith('Cannot load dayjs locale file for "fr"');
  });
});
