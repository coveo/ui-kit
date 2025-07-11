import Backend from 'i18next-http-backend';
import {describe, expect, it, vi} from 'vitest';
import type {AnyEngineType} from './bindings';
import {i18nBackendOptions, init18n} from './i18n';
import type {BaseAtomicInterface} from './interface-common';

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
      await Promise.resolve(
        options.request!({}, '/foo/en.json?lng=en&ns=other', {}, callback)
      );

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
    it('should call i18n.use and i18n.init with correct options', () => {
      const use = vi.fn().mockReturnThis();
      const init = vi.fn();
      const atomicInterface = {
        i18n: {use, init},
        logLevel: 'debug',
        language: 'en',
        languageAssetsPath: '/foo',
      } as unknown as BaseAtomicInterface<AnyEngineType>;

      init18n(atomicInterface);

      expect(use).toHaveBeenCalledExactlyOnceWith(Backend);
      expect(init).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          debug: true,
          lng: 'en',
          nsSeparator: '___',
          fallbackLng: 'en',
          backend: expect.any(Object),
          interpolation: expect.any(Object),
          compatibilityJSON: 'v4',
        })
      );
    });
  });
});
