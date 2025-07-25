import * as headless from '@coveo/headless/commerce';
import i18next from 'i18next';
import {html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {within} from 'shadow-dom-testing-library';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {bindings} from '@/src/decorators/bindings';
import type {InitializableComponent} from '@/src/decorators/types';
import {InitializeBindingsMixin} from '@/src/mixins/bindings-mixin';
import {markParentAsReady} from '@/src/utils/init-queue';
import {
  SafeStorage,
  type StandaloneSearchBoxData,
  StorageItems,
} from '@/src/utils/local-storage-utils';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {buildFakeCommerceEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/engine';
import {buildFakeContext} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/context-controller';
import {buildFakeSearch} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/search-controller';
import {buildFakeProductListing} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product-listing-controller';
import {buildFakeSummary} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/summary-subcontroller';
import {
  AtomicCommerceInterface,
  type CommerceBindings,
  type CommerceInitializationOptions,
} from './atomic-commerce-interface';
import {createCommerceStore} from './store';

vi.mock('i18next', {spy: true});
vi.mock('@coveo/headless/commerce', {spy: true});
vi.mock('./store', {spy: true});
vi.mock('@/src/utils/init-queue', {spy: true});
vi.mock('@/src/utils/local-storage-utils', () => ({
  SafeStorage: vi.fn().mockImplementation(() => ({
    getParsedJSON: vi.fn(),
    removeItem: vi.fn(),
  })),
  StorageItems: {
    STANDALONE_SEARCH_BOX_DATA: 'standalone-search-box-data',
  },
}));

@customElement('test-element')
@bindings()
class TestElement
  extends InitializeBindingsMixin(LitElement)
  implements InitializableComponent<CommerceBindings>
{
  @state()
  public bindings: CommerceBindings = {} as CommerceBindings;
  @state() public error!: Error;

  public initialize() {}

  public render() {
    return html`test-element`;
  }
}

describe('atomic-commerce-interface', () => {
  beforeEach(async () => {
    // Mock store methods
    vi.mocked(createCommerceStore).mockReturnValue({
      setLoadingFlag: vi.fn(),
      unsetLoadingFlag: vi.fn(),
      state: {
        iconAssetsPath: './assets',
        loadingFlags: ['firstRequestExecuted'],
        mobileBreakpoint: '768px',
      },
    } as any);

    // Mock i18next
    vi.mocked(i18next.createInstance).mockReturnValue({
      isInitialized: true,
    } as any);

    vi.mocked(headless.buildCommerceEngine).mockReturnValue(
      buildFakeCommerceEngine({})
    );
    vi.mocked(headless.buildContext).mockReturnValue(buildFakeContext({}));
    vi.mocked(headless.buildSearch).mockReturnValue(
      buildFakeSearch({
        implementation: {
          summary: vi.fn(() => buildFakeSummary()),
          urlManager: vi.fn(() => ({
            subscribe: vi.fn(() => ({unsubscribe: vi.fn()})),
            state: {fragment: ''},
          })),
          executeFirstSearch: vi.fn(),
        },
      })
    );
    vi.mocked(headless.buildProductListing).mockReturnValue(
      buildFakeProductListing({
        implementation: {
          summary: vi.fn(() => buildFakeSummary()),
          urlManager: vi.fn(() => ({
            subscribe: vi.fn(() => ({unsubscribe: vi.fn()})),
            state: {fragment: ''},
          })),
          executeFirstRequest: vi.fn(),
        },
      })
    );
    vi.mocked(headless.loadQueryActions).mockReturnValue({
      updateQuery: vi.fn((payload) => ({
        type: 'updateQuery',
        payload,
      })),
    } as any);
  });

  const setupElement = async ({
    analytics,
    iconAssetsPath,
    language,
    languageAssetsPath,
    logLevel,
    reflectStateInUrl,
    scrollContainer,
    type,
  }: {
    analytics?: boolean;
    iconAssetsPath?: string;
    language?: string;
    languageAssetsPath?: string;
    logLevel?: string;
    reflectStateInUrl?: boolean;
    scrollContainer?: string;
    type?: 'search' | 'product-listing';
  } = {}) => {
    const element = (await fixture<AtomicCommerceInterface>(
      html`<atomic-commerce-interface
        ?analytics=${analytics}
        icon-assets-path=${ifDefined(iconAssetsPath)}
        language=${ifDefined(language)}
        language-assets-path=${ifDefined(languageAssetsPath)}
        log-level=${ifDefined(logLevel)}
        ?reflect-state-in-url=${reflectStateInUrl}
        scroll-container=${ifDefined(scrollContainer)}
        type=${ifDefined(type)}
      >
      </atomic-commerce-interface>`
    )) as AtomicCommerceInterface;

    expect(element).toBeInstanceOf(AtomicCommerceInterface);
    return element;
  };

  const addChildElement = async <T extends TestElement>(
    element: AtomicCommerceInterface,
    tag = 'test-element'
  ) => {
    const childElement = document.createElement(
      tag
    ) as InitializableComponent<CommerceBindings> & T;
    element.appendChild(childElement);

    await childElement.updateComplete;
    expect(childElement).toBeInstanceOf(TestElement);

    return childElement;
  };

  describe('when created', () => {
    it('should create a store instance', async () => {
      const createCommerceStoreSpy = vi.mocked(createCommerceStore);
      const element = await setupElement();

      expect(createCommerceStoreSpy).toHaveBeenCalledOnce();
      expect(element.store).toBeDefined();
      expect(element.store).toBe(createCommerceStoreSpy.mock.results[0].value);
    });

    it('should create an i18n instance', async () => {
      const i18nextCreateInstanceSpy = vi.mocked(i18next.createInstance);
      const element = await setupElement();

      expect(i18nextCreateInstanceSpy).toHaveBeenCalledOnce();
      expect(element.i18n).toBeDefined();
      expect(element.i18n).toBe(i18nextCreateInstanceSpy.mock.results[0].value);
    });

    it('should set default type to search', async () => {
      const element = await setupElement();
      expect(element.type).toBe('search');
    });

    it('should set default analytics to true', async () => {
      const element = await setupElement();
      expect(element.analytics).toBe(true);
    });

    it('should set default reflectStateInUrl to true', async () => {
      const element = await setupElement();
      expect(element.reflectStateInUrl).toBe(true);
    });
  });

  describe('#initialize', () => {
    const sampleConfig: CommerceInitializationOptions = {
      organizationId: 'test-org',
      analytics: {trackingId: 'test-tracking'},
    } as CommerceInitializationOptions;

    it('should create a commerce engine with given configuration', async () => {
      const element = await setupElement();
      const buildCommerceEngineSpy = vi.mocked(headless.buildCommerceEngine);

      await element.initialize(sampleConfig);

      expect(buildCommerceEngineSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          configuration: expect.objectContaining({
            organizationId: 'test-org',
            analytics: expect.objectContaining({
              trackingId: 'test-tracking',
            }),
          }),
        })
      );
    });

    it('should set the engine property', async () => {
      const element = await setupElement();
      const mockEngine = buildFakeCommerceEngine({});
      vi.mocked(headless.buildCommerceEngine).mockReturnValue(mockEngine);

      await element.initialize(sampleConfig);

      expect(element.engine).toBe(mockEngine);
    });

    it('should set error when initialization fails', async () => {
      const element = await setupElement();
      const error = new Error('Initialization failed');
      vi.mocked(headless.buildCommerceEngine).mockImplementation(() => {
        throw error;
      });

      await expect(element.initialize(sampleConfig)).rejects.toThrow(error);
      expect(element.error).toBe(error);
    });
  });

  describe('#executeFirstRequest', () => {
    it('should log error when engine is not created', async () => {
      const element = await setupElement();
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation();

      await element.executeFirstRequest();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'You have to call "initialize" on the atomic-commerce-interface component before modifying the props or calling other public methods.',
        element
      );
    });
  });

  it('should render a slot', async () => {
    const element = await setupElement();

    expect(element.shadowRoot?.querySelector('slot')).toBeTruthy();
  });

  it('should render its children', async () => {
    const element = await setupElement();
    await addChildElement(element);

    expect(within(element).queryByShadowText('test-element')).toBeTruthy();
  });

  it('should provide bindings to its children', async () => {
    const element = await setupElement();
    const childElement = await addChildElement(element);

    const mockEngine = buildFakeCommerceEngine({});
    await element.initializeWithEngine(mockEngine);

    expect(childElement.bindings).toBe(element.bindings);
  });
});
