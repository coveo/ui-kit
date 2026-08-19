import {createInstance} from 'i18next';
import Backend from 'i18next-http-backend';
import {describe, expect, it, vi} from 'vitest';
import type {AnyEngineType} from './bindings';
import {i18nBackendOptions, init18n, loadTranslations} from './i18n';
import type {BaseAtomicInterface} from './interface-controller';

describe('i18n', () => {
  describe('#i18nBackendOptions', () => {
    it('should return an object with a loadPath and request function', () => {
      const atomicInterface = {
        languageAssetsPath: '/foo',
      } as BaseAtomicInterface<AnyEngineType>;

      const options = i18nBackendOptions(atomicInterface);

      expect(options).toHaveProperty('loadPath');
      expect(typeof options.request).toBe('function');
    });

    it('should execute callback with error for unsupported locale', async () => {
      const atomicInterface = {
        languageAssetsPath: '/foo',
      } as BaseAtomicInterface<AnyEngineType>;

      const options = i18nBackendOptions(atomicInterface);
      const callback = vi.fn();
      await Promise.resolve(
        options.request!({}, '/foo/en.json?lng=zz&ns=translation', {}, callback)
      );

      expect(callback).toHaveBeenCalledWith(expect.any(Error), {
        status: 404,
        data: '',
      });
    });

    it('should execute callback with error for unsupported namespace', async () => {
      const atomicInterface = {
        languageAssetsPath: '/foo',
      } as BaseAtomicInterface<AnyEngineType>;

      const options = i18nBackendOptions(atomicInterface);
      const callback = vi.fn();
      await Promise.resolve(options.request!({}, '/foo/en.json?lng=en&ns=other', {}, callback));

      expect(callback).toHaveBeenCalledWith(expect.any(Error), {
        status: 404,
        data: '',
      });
    });
    it('should execute callback with data for supported locale and namespace', async () => {
      vi.stubGlobal('isI18nLocaleAvailable', () => true);

      globalThis.fetch = vi.fn().mockResolvedValue({
        status: 200,
        json: () => Promise.resolve({foo: 'bar'}),
      });
      const atomicInterface = {
        languageAssetsPath: '/foo',
      } as BaseAtomicInterface<AnyEngineType>;

      const options = i18nBackendOptions(atomicInterface);
      const callback = vi.fn();

      await Promise.resolve(
        options.request!({}, '/foo/en.json?lng=en&ns=translation', {}, callback)
      );

      expect(callback).toHaveBeenCalledWith(null, {
        status: 200,
        data: {foo: 'bar'},
      });

      vi.unstubAllGlobals();
    });
  });

  describe('#init18n', () => {
    it('should call i18n.init with correct options, without registering the backend', async () => {
      const use = vi.fn().mockReturnThis();
      const init = vi.fn();
      const atomicInterface = {
        i18n: {use, init},
        logLevel: 'debug',
        language: 'en',
        languageAssetsPath: '/foo',
      } as unknown as BaseAtomicInterface<AnyEngineType>;

      init18n(atomicInterface);

      // Registering the backend would let i18next load the initial resources itself, which is
      // what discarded the consumer's strings.
      expect(use).not.toHaveBeenCalled();
      expect(init).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          debug: true,
          lng: 'en',
          nsSeparator: '___',
          fallbackLng: 'en',
          interpolation: expect.any(Object),
          compatibilityJSON: 'v4',
        })
      );
    });

    it('should not let its own strings overwrite strings already registered by the consumer', async () => {
      const atomicStrings = {
        'load-all-results': 'Load all results',
        'no-results': 'No results',
      };
      const respond = () => ({status: 200, json: () => Promise.resolve(atomicStrings)}) as Response;

      // The first request is held open so the consumer can register its override while Atomic's
      // resources are in flight; any later request resolves immediately.
      let releaseFirst: (() => void) | undefined;
      globalThis.fetch = vi.fn().mockImplementation(() => {
        if (releaseFirst) {
          return Promise.resolve(respond());
        }
        return new Promise((resolve) => {
          releaseFirst = () => resolve(respond());
        });
      });

      const i18n = createInstance();
      const atomicInterface = {
        i18n,
        language: 'en',
        languageAssetsPath: '/lang',
      } as unknown as BaseAtomicInterface<AnyEngineType>;

      const initialization = init18n(atomicInterface);

      await vi.waitFor(() => expect(releaseFirst).toBeDefined());
      i18n.addResourceBundle('en', 'translation', {
        'load-all-results': 'Show thread',
      });

      releaseFirst!();
      await initialization;

      expect(i18n.t('load-all-results')).toBe('Show thread');
      // Strings the consumer did not customize still come from Atomic.
      expect(i18n.t('no-results')).toBe('No results');
    });

    it('should also load the fallback language when the locale is not English', async () => {
      const requested: string[] = [];
      globalThis.fetch = vi.fn().mockImplementation((url) => {
        requested.push(String(url));
        return Promise.resolve({status: 200, json: () => Promise.resolve({greeting: 'x'})});
      });

      const i18n = createInstance();
      const atomicInterface = {
        i18n,
        language: 'fr-CA',
        languageAssetsPath: '/lang',
      } as unknown as BaseAtomicInterface<AnyEngineType>;

      await init18n(atomicInterface);

      expect(requested.some((u) => u.includes('/fr.json'))).toBe(true);
      expect(requested.some((u) => u.includes('/en.json'))).toBe(true);
    });
  });

  describe('#loadTranslations', () => {
    it('should add the loaded bundle without overwriting existing values', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        status: 200,
        json: () => Promise.resolve({greeting: 'Hello', farewell: 'Goodbye'}),
      });

      const i18n = createInstance();
      await i18n.init({lng: 'en', fallbackLng: 'en', resources: {}});
      i18n.addResourceBundle('en', 'translation', {greeting: 'Bonjour'});

      await loadTranslations(
        {i18n, languageAssetsPath: '/lang'} as unknown as BaseAtomicInterface<AnyEngineType>,
        'en'
      );

      expect(i18n.t('greeting')).toBe('Bonjour');
      expect(i18n.t('farewell')).toBe('Goodbye');
    });

    it('should strip the region from the requested language', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        status: 200,
        json: () => Promise.resolve({greeting: 'Bonjour'}),
      });

      const i18n = createInstance();
      await i18n.init({lng: 'fr', fallbackLng: 'en', resources: {}});

      await loadTranslations(
        {i18n, languageAssetsPath: '/lang'} as unknown as BaseAtomicInterface<AnyEngineType>,
        'fr-CA'
      );

      expect(i18n.getResourceBundle('fr', 'translation')).toEqual({greeting: 'Bonjour'});
    });
  });
});
