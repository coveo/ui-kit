import {
  BaseAtomicInterface,
  CommonAtomicInterfaceHelper,
} from '@/src/components/common/interface/interface-common.js';
import {setCoveoGlobal} from '@/src/global/environment.js';
import {loadDayjsLocale} from '@/src/utils/dayjs-locales.js';
import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture.js';
import {buildFakeCommerceEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/engine.js';
import type {CommerceEngine} from '@coveo/headless/commerce';
import Backend from 'i18next-http-backend';
import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {init18n} from './i18n.js';

vi.mock('@/src/global/environment.js', {spy: true});
vi.mock('./i18n.js', () => ({
  init18n: vi.fn(),
  i18nBackendOptions: vi.fn(() => ({})),
  i18nTranslationNamespace: 'translation',
}));
vi.mock('@/src/utils/dayjs-locales.js', {spy: true});
vi.mock('i18next-http-backend', () => {
  const mockBackend = vi.fn(() => ({
    read: vi.fn(),
  }));
  return {
    default: mockBackend,
  };
});

describe('#CommonAtomicInterfaceHelper', () => {
  const setupElement = async () => {
    const {atomicInterface} = await renderInAtomicCommerceInterface({
      template: html``,
    });

    return atomicInterface;
  };

  describe('#constructor', () => {
    it('should call the #setCoveoGlobal function with the provided global variable name', async () => {
      const atomicInterface = await setupElement();

      new CommonAtomicInterfaceHelper(atomicInterface, 'CoveoAtomic');

      expect(setCoveoGlobal).toHaveBeenCalledWith('CoveoAtomic');
    });

    describe('when the provided atomic interface has #connectedCallback and #render methods', async () => {
      it('should override the #connectedCallback method to initialize i18n before calling the original method', async () => {
        const atomicInterface = await setupElement();
        const originalConnectedCallbackSpy = vi.spyOn(
          atomicInterface,
          'connectedCallback'
        );

        new CommonAtomicInterfaceHelper(atomicInterface, 'CoveoAtomic');

        expect(init18n).not.toHaveBeenCalled();
        expect(originalConnectedCallbackSpy).not.toHaveBeenCalled();

        atomicInterface.connectedCallback();

        expect(init18n).toHaveBeenCalledExactlyOnceWith(atomicInterface);
        expect(originalConnectedCallbackSpy).toHaveBeenCalledOnce();
      });

      it('should override the #render method to render an atomic-component-error if necessary, or the original method otherwise', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const atomicInterface = await setupElement();
        atomicInterface.error = new Error('Test error');
        const render = vi.fn();
        // @ts-expect-error - Mocking the render method
        atomicInterface.render = render;

        expect(render).not.toHaveBeenCalled();

        new CommonAtomicInterfaceHelper(atomicInterface, 'CoveoAtomic');
        atomicInterface.requestUpdate();
        await atomicInterface.updateComplete;

        const errorComponentElement = atomicInterface.shadowRoot?.querySelector(
          'atomic-component-error'
        );

        expect(render).not.toHaveBeenCalled();
        await expect.element(errorComponentElement!).toBeInTheDocument();

        atomicInterface.error = undefined;
        atomicInterface.requestUpdate();
        await atomicInterface.updateComplete;

        await expect.element(errorComponentElement!).not.toBeInTheDocument();
        expect(render).toHaveBeenCalledOnce();
      });
    });

    it('should call #init18n with the provided atomic interface when its #connectedCallback or its #render method is missing', async () => {
      const atomicInterface = await setupElement();

      const incompleteAtomicInterface = {
        ...atomicInterface,
        bindings: atomicInterface.bindings,
        updateIconAssetsPath: atomicInterface.updateIconAssetsPath,
      } as BaseAtomicInterface<never> &
        HTMLElement & {connectedCallback?: () => void; render?: () => void};

      delete incompleteAtomicInterface.connectedCallback;
      delete incompleteAtomicInterface.render;

      new CommonAtomicInterfaceHelper(incompleteAtomicInterface, 'CoveoAtomic');

      expect(init18n).toHaveBeenCalledWith(incompleteAtomicInterface);
    });

    it('should not initialize i18n when #connectedCallback or #render are present in the provided atomic interface', async () => {
      const atomicInterface = await setupElement();

      new CommonAtomicInterfaceHelper(atomicInterface, 'CoveoAtomic');

      expect(init18n).not.toHaveBeenCalled();
    });
  });

  describe('#onComponentInitializing', () => {
    it('should call the initialize event #preventDefault and #stopPropagation functions', async () => {
      const atomicInterface = await setupElement();
      const helper = new CommonAtomicInterfaceHelper(
        atomicInterface,
        'CoveoAtomic'
      );
      const initializeEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        detail: vi.fn(),
      };

      helper.onComponentInitializing(initializeEvent as never);

      expect(initializeEvent.preventDefault).toHaveBeenCalledOnce();
      expect(initializeEvent.stopPropagation).toHaveBeenCalledOnce();
    });

    it('should call the initialize event #detail function with the atomic interface #bindings when the #engine exists', async () => {
      const atomicInterface = await setupElement();
      (atomicInterface as BaseAtomicInterface<CommerceEngine>).engine =
        buildFakeCommerceEngine();

      const helper = new CommonAtomicInterfaceHelper(
        atomicInterface,
        'CoveoAtomic'
      );

      const mockEventDetail = vi.fn();
      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        detail: mockEventDetail,
      };

      helper.onComponentInitializing(mockEvent as never);

      expect(mockEventDetail).toHaveBeenCalledExactlyOnceWith(
        atomicInterface.bindings
      );
    });

    it('should add initialize event to hanging list when #engine does not exist', async () => {
      const atomicInterface = await setupElement();
      const helper = new CommonAtomicInterfaceHelper(
        atomicInterface,
        'CoveoAtomic'
      );
      const initializeEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        detail: vi.fn(),
      };
      helper.onComponentInitializing(initializeEvent as never);

      expect(initializeEvent.detail).not.toHaveBeenCalled();

      await helper.onInitialization(vi.fn());

      expect(initializeEvent.detail).toHaveBeenCalledWith(
        atomicInterface.bindings
      );
    });
  });

  describe('#onInitialization', () => {
    it('should log a warning and return early when #engine is defined on the atomic interface', async () => {
      const atomicInterface = await setupElement();
      const engine = buildFakeCommerceEngine();
      (atomicInterface as BaseAtomicInterface<CommerceEngine>).engine = engine;
      const helper = new CommonAtomicInterfaceHelper(
        atomicInterface,
        'CoveoAtomic'
      );
      const initEngine = vi.fn();

      await helper.onInitialization(initEngine);

      expect(engine.logger.warn).toHaveBeenCalledExactlyOnceWith(
        'The atomic-commerce-interface component "initialize" has already been called.',
        atomicInterface
      );
      expect(initEngine).not.toHaveBeenCalled();
    });

    describe('when #engine is not defined on the atomic interface', () => {
      it('should call the atomic interface #updateIconAssetsPath function', async () => {
        const atomicInterface = await setupElement();
        const updateIconAssetsPathSpy = vi.spyOn(
          atomicInterface,
          'updateIconAssetsPath'
        );
        const helper = new CommonAtomicInterfaceHelper(
          atomicInterface,
          'CoveoAtomic'
        );

        await helper.onInitialization(vi.fn());

        expect(updateIconAssetsPathSpy).toHaveBeenCalledOnce();
      });

      it('should call the provided init engine function', async () => {
        const atomicInterface = await setupElement();
        const initEngine = vi.fn();
        const helper = new CommonAtomicInterfaceHelper(
          atomicInterface,
          'CoveoAtomic'
        );

        await helper.onInitialization(initEngine);

        expect(initEngine).toHaveBeenCalledOnce();
      });

      it('should call the atomic interface #registerFieldsToInclude function when defined', async () => {
        const atomicInterface = await setupElement();
        const helper = new CommonAtomicInterfaceHelper(
          atomicInterface,
          'CoveoAtomic'
        );

        await helper.onInitialization(vi.fn());

        expect(atomicInterface.registerFieldsToInclude).not.toHaveBeenCalled;

        atomicInterface.registerFieldsToInclude = vi.fn();
        await helper.onInitialization(vi.fn());

        expect(atomicInterface.registerFieldsToInclude).toHaveBeenCalledOnce();
      });

      it('should call the #loadDayjsLocale function with the atomic interface #language when #language defined', async () => {
        const loadDayjsLocaleSpy = vi.mocked(loadDayjsLocale);
        const atomicInterface = await setupElement();
        (atomicInterface as BaseAtomicInterface<CommerceEngine>).language =
          'fr';
        const helper = new CommonAtomicInterfaceHelper(
          atomicInterface,
          'CoveoAtomic'
        );

        await helper.onInitialization(vi.fn());

        expect(loadDayjsLocaleSpy).toHaveBeenCalledExactlyOnceWith('fr');
      });

      it("should call the #loadDayjsLocale function with 'en' when atomic interface #language is not defined", async () => {
        const loadDayjsLocaleSpy = vi.mocked(loadDayjsLocale);
        const atomicInterface = await setupElement();
        const helper = new CommonAtomicInterfaceHelper(
          atomicInterface,
          'CoveoAtomic'
        );

        await helper.onInitialization(vi.fn());

        expect(loadDayjsLocaleSpy).toHaveBeenCalledExactlyOnceWith('en');
      });

      it('should process hanging initialize events', async () => {
        const atomicInterface = await setupElement();
        const helper = new CommonAtomicInterfaceHelper(
          atomicInterface,
          'CoveoAtomic'
        );
        const hangingEvent1 = {
          preventDefault: vi.fn(),
          stopPropagation: vi.fn(),
          detail: vi.fn(),
        };
        const hangingEvent2 = {
          preventDefault: vi.fn(),
          stopPropagation: vi.fn(),
          detail: vi.fn(),
        };
        helper.onComponentInitializing(hangingEvent1 as never);
        helper.onComponentInitializing(hangingEvent2 as never);

        await helper.onInitialization(vi.fn());

        expect(hangingEvent1.detail).toHaveBeenCalledWith(
          atomicInterface.bindings
        );
        expect(hangingEvent2.detail).toHaveBeenCalledWith(
          atomicInterface.bindings
        );
      });
    });
  });

  describe('#onAnalyticsChange', () => {
    it('should call #engineIsCreated with the atomic interface #engine', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      const atomicInterface = await setupElement();
      const helper = new CommonAtomicInterfaceHelper(
        atomicInterface,
        'CoveoAtomic'
      );
      const engineIsCreatedSpy = vi.spyOn(helper, 'engineIsCreated');

      helper.onAnalyticsChange();

      expect(engineIsCreatedSpy).toHaveBeenCalledExactlyOnceWith(undefined);

      const engine = buildFakeCommerceEngine();
      (atomicInterface as BaseAtomicInterface<CommerceEngine>).engine = engine;

      helper.onAnalyticsChange();

      expect(helper.engineIsCreated).toHaveBeenCalledWith(engine);
    });

    it('should call the atomic interface #engine.disableAnalytics method when atomic interface #analytics is false', async () => {
      const atomicInterface = await setupElement();
      atomicInterface.analytics = false;
      const engine = buildFakeCommerceEngine();
      (atomicInterface as BaseAtomicInterface<CommerceEngine>).engine = engine;
      const helper = new CommonAtomicInterfaceHelper(
        atomicInterface,
        'CoveoAtomic'
      );

      helper.onAnalyticsChange();

      expect(engine.disableAnalytics).toHaveBeenCalled();
    });

    it('should call the atomic interface #engine.enableAnalytics method when atomic interface #analytics is true', async () => {
      const atomicInterface = await setupElement();
      atomicInterface.analytics = true;
      const engine = buildFakeCommerceEngine();
      (atomicInterface as BaseAtomicInterface<CommerceEngine>).engine = engine;
      const helper = new CommonAtomicInterfaceHelper(
        atomicInterface,
        'CoveoAtomic'
      );

      helper.onAnalyticsChange();

      expect(engine.enableAnalytics).toHaveBeenCalled();
    });
  });

  describe('#onLanguageChange', () => {
    it('should use the provided newLanguage parameter when it is defined', async () => {
      const mockReadMethod = vi.fn();
      vi.mocked(Backend).mockImplementation(
        () =>
          ({
            read: mockReadMethod,
          }) as unknown as Backend
      );

      const atomicInterface = await setupElement();
      (atomicInterface as BaseAtomicInterface<CommerceEngine>).language = 'fr';
      const changeLanguageSpy = vi.spyOn(
        atomicInterface.i18n,
        'changeLanguage'
      );
      const helper = new CommonAtomicInterfaceHelper(
        atomicInterface,
        'CoveoAtomic'
      );

      helper.onLanguageChange('it');

      expect(mockReadMethod).toHaveBeenCalledExactlyOnceWith(
        'it',
        'translation',
        expect.any(Function)
      );

      const callback = mockReadMethod.mock.calls[0][2];
      const mockData = {key: 'value'};
      callback(null, mockData);

      expect(changeLanguageSpy).toHaveBeenCalledExactlyOnceWith('it');
    });

    it('should use the atomic interface language when newLanguage is not provided', async () => {
      const mockReadMethod = vi.fn();
      vi.mocked(Backend).mockImplementation(
        () =>
          ({
            read: mockReadMethod,
          }) as unknown as Backend
      );

      const atomicInterface = await setupElement();
      (atomicInterface as BaseAtomicInterface<CommerceEngine>).language = 'fr';
      const changeLanguageSpy = vi.spyOn(
        atomicInterface.i18n,
        'changeLanguage'
      );
      const helper = new CommonAtomicInterfaceHelper(
        atomicInterface,
        'CoveoAtomic'
      );

      helper.onLanguageChange();

      expect(mockReadMethod).toHaveBeenCalledExactlyOnceWith(
        'fr',
        'translation',
        expect.any(Function)
      );

      // Execute the callback that would be called by Backend.read
      const callback = mockReadMethod.mock.calls[0][2];
      const mockData = {key: 'value'};
      callback(null, mockData);

      // Should use the interface language when no new language is provided
      expect(changeLanguageSpy).toHaveBeenCalledExactlyOnceWith('fr');
    });

    it('should call #loadDayjsLocale with the atomic interface language when it is defined', async () => {
      const loadDayjsLocaleSpy = vi.mocked(loadDayjsLocale);
      const atomicInterface = await setupElement();
      (atomicInterface as BaseAtomicInterface<CommerceEngine>).language = 'fr';
      const helper = new CommonAtomicInterfaceHelper(
        atomicInterface,
        'CoveoAtomic'
      );

      helper.onLanguageChange();

      expect(loadDayjsLocaleSpy).toHaveBeenCalledExactlyOnceWith('fr');
    });

    it("should call #loadDayjsLocale with 'en' when atomic interface language is not defined", async () => {
      const loadDayjsLocaleSpy = vi.mocked(loadDayjsLocale);
      const atomicInterface = await setupElement();
      const helper = new CommonAtomicInterfaceHelper(
        atomicInterface,
        'CoveoAtomic'
      );

      helper.onLanguageChange();

      expect(loadDayjsLocaleSpy).toHaveBeenCalledExactlyOnceWith('en');
    });

    it('should create a new #Backend instance with i18n services and backend options', async () => {
      const BackendSpy = vi.mocked(Backend);
      const atomicInterface = await setupElement();
      const helper = new CommonAtomicInterfaceHelper(
        atomicInterface,
        'CoveoAtomic'
      );

      helper.onLanguageChange();

      expect(BackendSpy).toHaveBeenCalledExactlyOnceWith(
        atomicInterface.i18n.services,
        expect.any(Object)
      );
    });

    it('should call #Backend.read with correct arguments for full language code', async () => {
      const mockReadMethod = vi.fn();
      const BackendSpy = vi.mocked(Backend).mockImplementation(
        () =>
          ({
            read: mockReadMethod,
          }) as unknown as Backend
      );

      const atomicInterface = await setupElement();
      (atomicInterface as BaseAtomicInterface<CommerceEngine>).language =
        'fr-CA';
      const helper = new CommonAtomicInterfaceHelper(
        atomicInterface,
        'CoveoAtomic'
      );

      helper.onLanguageChange();

      expect(BackendSpy).toHaveBeenCalled();
      expect(mockReadMethod).toHaveBeenCalledExactlyOnceWith(
        'fr',
        'translation',
        expect.any(Function)
      );
    });

    it('should call #Backend.read with correct arguments for simple language code', async () => {
      const mockReadMethod = vi.fn();
      const BackendSpy = vi.mocked(Backend).mockImplementation(
        () =>
          ({
            read: mockReadMethod,
          }) as unknown as Backend
      );

      const atomicInterface = await setupElement();
      (atomicInterface as BaseAtomicInterface<CommerceEngine>).language = 'es';
      const helper = new CommonAtomicInterfaceHelper(
        atomicInterface,
        'CoveoAtomic'
      );

      helper.onLanguageChange();

      expect(BackendSpy).toHaveBeenCalled();
      expect(mockReadMethod).toHaveBeenCalledExactlyOnceWith(
        'es',
        'translation',
        expect.any(Function)
      );
    });

    describe('when #Backend.read callback is executed', () => {
      it('should call #i18n.addResourceBundle with correct arguments', async () => {
        const mockReadMethod = vi.fn();
        vi.mocked(Backend).mockImplementation(
          () =>
            ({
              read: mockReadMethod,
            }) as unknown as Backend
        );

        const atomicInterface = await setupElement();
        (atomicInterface as BaseAtomicInterface<CommerceEngine>).language =
          'de-DE';
        const addResourceBundleSpy = vi.spyOn(
          atomicInterface.i18n,
          'addResourceBundle'
        );
        const helper = new CommonAtomicInterfaceHelper(
          atomicInterface,
          'CoveoAtomic'
        );

        helper.onLanguageChange();

        // Execute the callback that would be called by Backend.read
        const callback = mockReadMethod.mock.calls[0][2];
        const mockData = {key: 'value'};
        callback(null, mockData);

        expect(addResourceBundleSpy).toHaveBeenCalledExactlyOnceWith(
          'de',
          'translation',
          mockData,
          true,
          false
        );
      });

      it('should call #i18n.changeLanguage with the full language code', async () => {
        const mockReadMethod = vi.fn();
        vi.mocked(Backend).mockImplementation(
          () =>
            ({
              read: mockReadMethod,
            }) as unknown as Backend
        );

        const atomicInterface = await setupElement();
        (atomicInterface as BaseAtomicInterface<CommerceEngine>).language =
          'pt-BR';
        const changeLanguageSpy = vi.spyOn(
          atomicInterface.i18n,
          'changeLanguage'
        );
        const helper = new CommonAtomicInterfaceHelper(
          atomicInterface,
          'CoveoAtomic'
        );

        helper.onLanguageChange();

        // Execute the callback that would be called by Backend.read
        const callback = mockReadMethod.mock.calls[0][2];
        const mockData = {key: 'value'};
        callback(null, mockData);

        expect(changeLanguageSpy).toHaveBeenCalledExactlyOnceWith('pt-BR');
      });
    });

    it("should work correctly when language is undefined and fallback to 'en'", async () => {
      const mockReadMethod = vi.fn();
      vi.mocked(Backend).mockImplementation(
        () =>
          ({
            read: mockReadMethod,
          }) as unknown as Backend
      );

      const atomicInterface = await setupElement();
      (atomicInterface as BaseAtomicInterface<CommerceEngine>).language =
        undefined;
      const addResourceBundleSpy = vi.spyOn(
        atomicInterface.i18n,
        'addResourceBundle'
      );
      const changeLanguageSpy = vi.spyOn(
        atomicInterface.i18n,
        'changeLanguage'
      );
      const helper = new CommonAtomicInterfaceHelper(
        atomicInterface,
        'CoveoAtomic'
      );

      helper.onLanguageChange();

      expect(mockReadMethod).toHaveBeenCalledExactlyOnceWith(
        'en',
        'translation',
        expect.any(Function)
      );

      // Execute the callback
      const callback = mockReadMethod.mock.calls[0][2];
      const mockData = {key: 'value'};
      callback(null, mockData);

      expect(addResourceBundleSpy).toHaveBeenCalledExactlyOnceWith(
        'en',
        'translation',
        mockData,
        true,
        false
      );
      expect(changeLanguageSpy).toHaveBeenCalledExactlyOnceWith(undefined);
    });

    it('should handle complex language code with multiple dashes correctly', async () => {
      const mockReadMethod = vi.fn();
      vi.mocked(Backend).mockImplementation(
        () =>
          ({
            read: mockReadMethod,
          }) as unknown as Backend
      );

      const atomicInterface = await setupElement();
      (atomicInterface as BaseAtomicInterface<CommerceEngine>).language =
        'zh-Hans-CN';
      const helper = new CommonAtomicInterfaceHelper(
        atomicInterface,
        'CoveoAtomic'
      );

      helper.onLanguageChange();

      // Should use only the first part before the first dash
      expect(mockReadMethod).toHaveBeenCalledExactlyOnceWith(
        'zh',
        'translation',
        expect.any(Function)
      );
    });
  });

  describe('#engineIsCreated', () => {
    it('should return true when engine is provided', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const atomicInterface = await setupElement();
      const engine = buildFakeCommerceEngine();
      (atomicInterface as BaseAtomicInterface<CommerceEngine>).engine = engine;
      const helper = new CommonAtomicInterfaceHelper(
        atomicInterface,
        'CoveoAtomic'
      );

      const result = helper.engineIsCreated(engine);

      expect(result).toBe(true);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should return false and log error when engine is undefined', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const atomicInterface = await setupElement();
      const helper = new CommonAtomicInterfaceHelper(
        atomicInterface,
        'CoveoAtomic'
      );

      const result = helper.engineIsCreated(undefined);

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'You have to call "initialize" on the atomic-commerce-interface component before modifying the props or calling other public methods.',
        atomicInterface
      );
    });
  });
});
