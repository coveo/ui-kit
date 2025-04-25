import {createTestI18n} from '@/vitest-utils/i18n-utils';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {fixtureCleanup} from '@/vitest-utils/testing-helpers/fixture-wrapper';
import * as headless from '@coveo/headless/commerce';
import {page} from '@vitest/browser/context';
import '@vitest/browser/matchers.d.ts';
import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {describe, expect, Mock, MockInstance, vi} from 'vitest';
import * as store from '../../common/interface/store';
import {ItemRenderingFunction} from '../../common/item-list/item-list-common-lit';
import {
  ItemDisplayDensity,
  ItemDisplayImageSize,
  ItemDisplayLayout,
} from '../../common/layout/display-options';
import {CommerceStore} from '../atomic-commerce-interface/store';
import './atomic-commerce-product-list';
import {AtomicCommerceProductList} from './atomic-commerce-product-list';

// atomic-product stub
@customElement('atomic-product')
export class AtomicProduct extends LitElement {
  @property({type: Object}) public content: ParentNode = new DocumentFragment();
  @property() public density: ItemDisplayDensity = 'normal';
  @property() public display: ItemDisplayLayout = 'list';
  @property() public imageSize: ItemDisplayImageSize = 'icon';
  @property({type: Object})
  public interactiveProduct!: headless.InteractiveProduct;
  @property({type: Object}) public linkContent: ParentNode =
    new DocumentFragment();
  @property() public loadingFlag?: string;
  @property({type: Object}) public product!: headless.Product;
  @property() public renderingFunction: ItemRenderingFunction;
  @property({type: Object}) public store?: CommerceStore;

  constructor() {
    super();
  }

  public render() {
    return html`<div></div>`;
  }
}

const mocks = vi.hoisted(() => {
  return {
    summaryState: {
      hasError: false,
      firstRequestExecuted: true,
      hasProducts: true,
    },
    searchOrListingState: {
      products: Array.from({length: 15}, (_, i) => ({permanentid: i + 1})),
      hasError: false,
      firstRequestExecuted: true,
      hasProducts: true,
      isLoading: false,
      responseId: 'responseId',
    },
    summary: vi.fn(() => ({
      subscribe: vi.fn(),
    })),
    searchOrListing: vi.fn(() => ({
      promoteChildToParent: vi.fn(),
      interactiveProduct: vi.fn(() => vi.fn()),
      summary: vi.fn(() => ({
        subscribe: vi.fn(),
      })),
    })),
    interfaceElementType: 'product-listing',
  };
});

vi.mock('@/src/components/common/interface/store');

vi.mock('@/src/decorators/bind-state', async () => {
  return {
    bindStateToController: vi.fn(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (proto: any, stateProperty: string) => {
        Object.defineProperty(proto, stateProperty, {
          get() {
            return mocks[stateProperty as keyof typeof mocks];
          },
        });
      };
    }),
  };
});

const i18n = await createTestI18n();

vi.mock('@/src/mixins/bindings-mixin', () => ({
  InitializeBindingsMixin: vi.fn().mockImplementation((superClass) => {
    return class extends superClass {
      constructor(...args: unknown[]) {
        super(...args);
        this.bindings = {
          store: {
            setLoadingFlag: vi.fn(),
            state: {
              resultList: {
                focusOnFirstResultAfterNextSearch: () => {},
              },
            },
            onChange: vi.fn(),
            unsetLoadingFlag: vi.fn(),
          },
          engine: {
            subscribe: vi.fn(),
          },
          interfaceElement: {
            type: mocks.interfaceElementType,
          },
          i18n,
        };

        this.searchOrListing = mocks.searchOrListing;
        this.summary = mocks.summary;
      }
    };
  }),
  BindingController: class {},
}));

vi.mock(import('@coveo/headless/commerce'), async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    buildProductListing: vi.fn(() => ({
      id: 'product-listing-controller',
      promoteChildToParent: vi.fn(),
      interactiveProduct: vi.fn(() => vi.fn()),
      summary: vi.fn(() => ({
        id: 'product-listing-summary-controller',
        subscribe: vi.fn(),
      })),
      subscribe: vi.fn(),
    })),
    buildSearch: vi.fn(() => ({
      id: 'search-controller',
      promoteChildToParent: vi.fn(),
      interactiveProduct: vi.fn(() => vi.fn()),
      summary: vi.fn(() => ({
        id: 'search-summary-controller',
        subscribe: vi.fn(),
      })),
      subscribe: vi.fn(),
    })),
  } as typeof mod & {buildProductListing: Mock; buildSearch: Mock};
});

describe('AtomicCommerceProductList', () => {
  const setupElement = async ({
    display = 'grid',
    density = 'normal',
    imageSize = 'small',
    numberOfPlaceholders = 24,
    isAppLoaded = true,
    initialize = true,
  }: {
    display?: ItemDisplayLayout;
    density?: ItemDisplayDensity;
    imageSize?: ItemDisplayImageSize;
    numberOfPlaceholders?: number;
    isAppLoaded?: boolean;
    initialize?: boolean;
  }) => {
    const element = await fixture<AtomicCommerceProductList>(
      html`<atomic-commerce-product-list
        .display=${display}
        .density=${density}
        .imageSize=${imageSize}
        .numberOfPlaceholders=${numberOfPlaceholders}
      ></atomic-commerce-product-list>`
    );

    //@ts-expect-error - mocking would be complex
    element.isAppLoaded = isAppLoaded;

    initialize && element.initialize();

    return element;
  };

  beforeEach(() => {
    fixtureCleanup();
    vi.resetAllMocks();
  });

  describe('#constructor', () => {
    it('should create correct instance', async () => {
      const element = await setupElement({initialize: false});

      expect(element).toBeInstanceOf(AtomicCommerceProductList);
    });
  });

  describe('#initialize', () => {
    it('when #density is invalid, should throw', async () => {
      const element = await setupElement({
        density: 'invalid' as ItemDisplayDensity,
        initialize: false,
      });

      vi.spyOn(element, 'initialize');

      expect(() => element.initialize()).toThrow();
    });

    it('when #display is invalid, should throw', async () => {
      const element = await setupElement({
        display: 'invalid' as ItemDisplayLayout,
        initialize: false,
      });

      vi.spyOn(element, 'initialize');

      expect(() => element.initialize()).toThrow();
    });

    it('when #imageSize is invalid, should throw', async () => {
      const element = await setupElement({
        imageSize: 'invalid' as ItemDisplayImageSize,
        initialize: false,
      });

      vi.spyOn(element, 'initialize');

      expect(() => element.initialize()).toThrow();
    });

    it('when #numberOfPlaceholders is invalid, should throw', async () => {
      const element = await setupElement({
        numberOfPlaceholders: -1,
        initialize: false,
      });

      vi.spyOn(element, 'initialize');

      expect(() => element.initialize()).toThrow();
    });

    it('when all props are valid, should not throw', async () => {
      const element = await setupElement({
        initialize: false,
      });

      vi.spyOn(element, 'initialize');

      expect(() => element.initialize()).not.toThrow();
    });

    describe("when interface element type is 'product-listing'", () => {
      let buildProductListingSpy: MockInstance;

      beforeEach(() => {
        vi.spyOn(mocks, 'interfaceElementType', 'get').mockReturnValue(
          'product-listing'
        );
        buildProductListingSpy = vi.spyOn(headless, 'buildProductListing');
      });

      it('should initialize #searchOrListing as product listing controller', async () => {
        const element = await setupElement({});

        expect(buildProductListingSpy).toHaveBeenCalledOnce();
        expect(buildProductListingSpy).toHaveBeenCalledWith(
          element.bindings.engine
        );
        expect(element.searchOrListing).toBe(
          buildProductListingSpy.mock.results[0].value
        );
      });

      it('should initialize #summary as product listing summary controller', async () => {
        const element = await setupElement({});

        expect(
          buildProductListingSpy.mock.results[0].value.summary
        ).toHaveBeenCalledOnce();
        expect(element.summary).toBe(
          buildProductListingSpy.mock.results[0].value.summary.mock.results[0]
            .value
        );
      });

      it('should subscribe to summary controller state changes', async () => {
        await setupElement({});

        const summarySubscribeSpy =
          buildProductListingSpy.mock.results[0].value.summary.mock.results[0]
            .value.subscribe;

        expect(summarySubscribeSpy).toHaveBeenCalledOnce();
      });
    });

    describe("when interface element type is 'search'", () => {
      let buildSearchSpy: MockInstance;
      beforeEach(() => {
        vi.spyOn(mocks, 'interfaceElementType', 'get').mockReturnValue(
          'search'
        );
        buildSearchSpy = vi.spyOn(headless, 'buildSearch');
      });

      it('should initialize #searchOrListing as search controller', async () => {
        const element = await setupElement({});

        expect(buildSearchSpy).toHaveBeenCalledOnce();
        expect(buildSearchSpy).toHaveBeenCalledWith(element.bindings.engine);
        expect(element.searchOrListing).toBe(
          buildSearchSpy.mock.results[0].value
        );
      });

      it('should initialize #summary as search summary controller', async () => {
        const element = await setupElement({});

        expect(
          buildSearchSpy.mock.results[0].value.summary
        ).toHaveBeenCalledOnce();
        expect(element.summary).toBe(
          buildSearchSpy.mock.results[0].value.summary.mock.results[0].value
        );
      });

      it('should subscribe to summary controller state changes', async () => {
        await setupElement({});

        const summarySubscribeSpy =
          buildSearchSpy.mock.results[0].value.summary.mock.results[0].value
            .subscribe;

        expect(summarySubscribeSpy).toHaveBeenCalledOnce();
      });
    });

    it('should add select child product event listener with correct callback', async () => {
      const element = await setupElement({});

      element.initialize();

      const event = new CustomEvent('atomic/selectChildProduct', {
        detail: {child: 'childProductId'},
      });

      element.host.dispatchEvent(event);

      expect(element.searchOrListing.promoteChildToParent).toHaveBeenCalledWith(
        'childProductId'
      );
    });

    it('should create app loaded listener with correct callback', async () => {
      const element = await setupElement({
        initialize: false,
        isAppLoaded: false,
      });

      const createAppLoadedListenerSpy = vi.spyOn(
        store,
        'createAppLoadedListener'
      );

      element.initialize();

      expect(createAppLoadedListenerSpy).toHaveBeenCalledOnce();
      expect(createAppLoadedListenerSpy).toHaveBeenCalledWith(
        element.bindings.store,
        expect.any(Function)
      );

      const callback = createAppLoadedListenerSpy.mock.calls[0][1];

      callback(true);
      await element.updateComplete;

      expect(
        element.shadowRoot!.querySelector('atomic-result-placeholder')
      ).toBeNull();

      callback(false);
      await element.updateComplete;

      expect(
        element.shadowRoot!.querySelector('atomic-result-placeholder')
      ).not.toBeNull();
    });
  });

  describe('#disconnectedCallback', () => {
    it('should unsubscribe from summary controller state changes', async () => {
      const element = await setupElement({});

      // @ts-expect-error - spying on private property
      const unsubscribeSummarySpy = vi.spyOn(element, 'unsubscribeSummary');

      element.disconnectedCallback();

      expect(unsubscribeSummarySpy).toHaveBeenCalledOnce();
    });

    it('should remove select child product event listener', async () => {
      const element = await setupElement({});

      const removeEventListenerSpy = vi.spyOn(
        element.host,
        'removeEventListener'
      );

      element.disconnectedCallback();

      expect(removeEventListenerSpy).toHaveBeenCalledOnce();
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'atomic/selectChildProduct',
        expect.any(Function)
      );
    });
  });

  describe('#render', () => {
    it('when bindings are undefined, should not render', async () => {
      const element = await setupElement({});

      // @ts-expect-error - testing private property
      element.bindings = undefined;

      await element.updateComplete;

      expect(element.shadowRoot!.querySelectorAll('*')).toHaveLength(0);
    });

    it('when there is an error, should not render', async () => {
      vi.spyOn(mocks.summaryState, 'hasError', 'get').mockReturnValue(true);

      const element = await setupElement({});
      await element.updateComplete;

      expect(element.shadowRoot!.querySelectorAll('*')).toHaveLength(0);
    });

    it('when no template is registered, should not render', async () => {
      const element = await setupElement({});
      //@ts-expect-error - mocking would be complex
      element.resultTemplateRegistered = false;
      await element.updateComplete;

      expect(element.shadowRoot!.querySelectorAll('*')).toHaveLength(0);
    });

    it('when first request was executed & there are no products, should not render', async () => {
      vi.spyOn(mocks.summaryState, 'hasProducts', 'get').mockReturnValue(false);

      const element = await setupElement({});
      await element.updateComplete;

      expect(element.shadowRoot!.querySelectorAll('*')).toHaveLength(0);
    });

    describe('when rendering', () => {
      it('when template has error, should render empty slot', async () => {
        const element = await setupElement({});

        //@ts-expect-error - mocking would be needlessly complex here, so we're directly setting the private property
        element.templateHasError = true;
        await element.updateComplete;

        expect(element.shadowRoot!.querySelectorAll('*')).toHaveLength(1);
        expect(element.shadowRoot!.querySelector('slot')).toBeTruthy();
      });

      describe("when #display is 'table'", () => {
        it('when app is not loaded, should render 1 placeholder', async () => {
          const element = await setupElement({
            isAppLoaded: false,
            display: 'table',
          });

          await element.updateComplete;

          const placeholderElements = element.shadowRoot!.querySelectorAll(
            'atomic-result-table-placeholder'
          );

          expect(placeholderElements).toHaveLength(1);
        });

        describe('when app is loaded', () => {
          const testWrapperRendering = async ({
            density,
            imageSize,
          }: {
            density?: ItemDisplayDensity;
            imageSize?: ItemDisplayImageSize;
          }) => {
            const element = await setupElement({
              display: 'table',
              ...(density && {density}),
              ...(imageSize && {imageSize}),
            });

            const mockTableTemplate = document.createDocumentFragment();
            mockTableTemplate.appendChild(
              document.createElement('atomic-table-element')
            );

            vi.spyOn(
              // @ts-expect-error - mocking method on private property
              element.productTemplateProvider,
              'getTemplateContent'
            ).mockReturnValue(mockTableTemplate);

            await element.updateComplete;

            const resultTableElement = element.shadowRoot!.querySelector(
              '[part="result-table"]'
            )!;
            const resultTableLocator = page.elementLocator(resultTableElement);

            const expectedClass = [
              'display-table',
              density ? ` density-${density}` : '',
              imageSize ? ` image-${imageSize}` : '',
            ].join('');

            await expect.element(resultTableLocator).toBeInTheDocument();
            await expect.element(resultTableLocator).toHaveClass(expectedClass);
          };

          it('should have correct display class', async () => {
            await testWrapperRendering({});
          });

          describe.each<{
            density: ItemDisplayDensity;
          }>([
            {density: 'normal'},
            {density: 'comfortable'},
            {density: 'compact'},
          ])('when #density is $density', ({density}) => {
            it('should have correct density class', async () => {
              await testWrapperRendering({density});
            });
          });

          describe.each<{imageSize: ItemDisplayImageSize}>([
            {imageSize: 'small'},
            {imageSize: 'large'},
            {imageSize: 'icon'},
            {imageSize: 'none'},
          ])('when #imageSize is $imageSize', ({imageSize}) => {
            it('should have correct image size class', async () => {
              await testWrapperRendering({imageSize});
            });
          });

          atomicProductRenderingTestCases('table');
        });
      });

      describe.each<{display: ItemDisplayLayout}>([
        {display: 'grid'},
        {display: 'list'},
      ])('when #display is $display', ({display}) => {
        it('when app is not loaded, should render correct # of placeholders', async () => {
          const numberOfPlaceholders = 12;

          const element = await setupElement({
            isAppLoaded: false,
            display,
            numberOfPlaceholders,
          });
          await element.updateComplete;

          const placeholderElements = element.shadowRoot!.querySelectorAll(
            'atomic-result-placeholder'
          );

          expect(placeholderElements).toHaveLength(numberOfPlaceholders);
        });

        describe('when app is loaded', () => {
          const testWrapperRendering = async ({
            density,
            imageSize,
          }: {
            density?: ItemDisplayDensity;
            imageSize?: ItemDisplayImageSize;
          }) => {
            const element = await setupElement({
              display,
              ...(density && {density}),
              ...(imageSize && {imageSize}),
            });

            await element.updateComplete;

            const listWrapperElement =
              element.shadowRoot!.querySelector('.list-wrapper')!;
            const listWrapperLocator = page.elementLocator(listWrapperElement);

            const listRootElement = listWrapperElement.querySelector(
              '[part="result-list"]'
            )!;
            const listRootLocator = page.elementLocator(listRootElement);

            const expectedClass = [
              `display-${display}`,
              density ? ` density-${density}` : '',
              imageSize ? ` image-${imageSize}` : '',
            ].join('');

            await expect.element(listWrapperLocator).toBeInTheDocument();
            await expect.element(listWrapperLocator).toHaveClass(expectedClass);
            await expect.element(listRootLocator).toBeInTheDocument();
            await expect.element(listRootLocator).toHaveClass(expectedClass);
          };

          it('should have correct display class', async () => {
            await testWrapperRendering({});
          });

          atomicProductRenderingTestCases(display);

          describe.each<{
            density: ItemDisplayDensity;
          }>([
            {density: 'normal'},
            {density: 'comfortable'},
            {density: 'compact'},
          ])('when the #density prop is $density', ({density}) => {
            it('should have correct density class', async () => {
              await testWrapperRendering({density});
            });
          });

          describe.each<{imageSize: ItemDisplayImageSize}>([
            {imageSize: 'small'},
            {imageSize: 'large'},
            {imageSize: 'icon'},
            {imageSize: 'none'},
          ])('when the #imageSize prop is $imageSize', ({imageSize}) => {
            it('should have correct image size class', async () => {
              await testWrapperRendering({imageSize});
            });
          });
        });
      });
    });

    const atomicProductRenderingTestCases = (display: ItemDisplayLayout) => {
      const setupTableTemplate = (element: AtomicCommerceProductList) => {
        const mockTableTemplate = document.createDocumentFragment();
        mockTableTemplate.appendChild(
          document.createElement('atomic-table-element')
        );

        vi.spyOn(
          // @ts-expect-error - mocking method on private property
          element.productTemplateProvider,
          'getTemplateContent'
        ).mockReturnValue(mockTableTemplate);
      };

      it('should render correct # of atomic-product', async () => {
        const expectedNumberOfProducts = 9;

        vi.spyOn(mocks.searchOrListingState, 'products', 'get').mockReturnValue(
          Array.from({length: expectedNumberOfProducts}, (_, i) => ({
            permanentid: i + 1,
          }))
        );

        const element = await setupElement({
          display,
        });
        display === 'table' && setupTableTemplate(element);

        await element.updateComplete;

        const productElements =
          element.shadowRoot!.querySelectorAll('atomic-product');

        expect(productElements).toHaveLength(expectedNumberOfProducts);
      });

      describe('each atomic-product', () => {
        if (display === 'table') {
          it('should receive correct table template #content', async () => {
            const mockProduct1 = {permanentid: 123};
            const mockProduct2 = {permanentid: 456};

            vi.spyOn(
              mocks.searchOrListingState,
              'products',
              'get'
            ).mockReturnValue([mockProduct1, mockProduct2]);

            const element = await setupElement({display});

            const content = document.createDocumentFragment();
            const template = document.createElement('template');
            template.innerHTML =
              '<atomic-table-element label="test"><div>Test</div>';
            content.appendChild(template.content);

            const getTemplateContentSpy = vi
              .spyOn(
                // @ts-expect-error - mocking return value of method on private property
                element.productTemplateProvider,
                'getTemplateContent'
              )
              .mockReturnValue(content);

            await element.updateComplete;

            const productElements =
              element.shadowRoot!.querySelectorAll('atomic-product')!;

            expect(getTemplateContentSpy).toHaveBeenCalledTimes(3);
            expect(getTemplateContentSpy.mock.calls).toEqual([
              [mockProduct1],
              [mockProduct1],
              [mockProduct2],
            ]);
            expect(productElements[0].content).toEqual(
              content.querySelector('atomic-table-element')
            );
            expect(productElements[1].content).toEqual(
              content.querySelector('atomic-table-element')
            );
          });
        } else {
          it('should receive correct template #content', async () => {
            const mockProduct1 = {permanentid: 123};
            const mockProduct2 = {permanentid: 456};

            vi.spyOn(
              mocks.searchOrListingState,
              'products',
              'get'
            ).mockReturnValue([mockProduct1, mockProduct2]);

            const element = await setupElement({display});

            const mockTemplate = document.createDocumentFragment();
            mockTemplate.appendChild(document.createElement('div'));

            const getTemplateContentSpy = vi
              .spyOn(
                // @ts-expect-error - mocking return value of method on private property
                element.productTemplateProvider,
                'getTemplateContent'
              )
              .mockReturnValueOnce(mockTemplate);

            await element.updateComplete;

            const productElements =
              element.shadowRoot!.querySelectorAll('atomic-product')!;

            expect(getTemplateContentSpy).toHaveBeenCalledTimes(2);
            expect(getTemplateContentSpy.mock.calls).toEqual([
              [mockProduct1],
              [mockProduct2],
            ]);
            expect(productElements[0].content).toBe(mockTemplate);
            expect(productElements[1].content).toBe(
              getTemplateContentSpy.mock.results[1].value
            );
          });
        }
        it('should receive correct #density', async () => {
          const element = await setupElement({display});
          display === 'table' && setupTableTemplate(element);

          const mockDensity = 'mockDensity' as ItemDisplayDensity;

          vi.spyOn(element, 'density', 'get').mockReturnValue(mockDensity);

          await element.updateComplete;

          const productElement =
            element.shadowRoot!.querySelector('atomic-product')!;

          expect(productElement.density).toBe(mockDensity);
        });

        it('should receive correct #display', async () => {
          const element = await setupElement({display});
          display === 'table' && setupTableTemplate(element);

          await element.updateComplete;

          const productElement =
            element.shadowRoot!.querySelector('atomic-product')!;

          expect(productElement.display).toBe(display);
        });

        it('should receive correct #imageSize', async () => {
          const element = await setupElement({display});
          display === 'table' && setupTableTemplate(element);

          const mockImageSize = 'mockImageSize' as ItemDisplayImageSize;

          vi.spyOn(element, 'imageSize', 'get').mockReturnValue(mockImageSize);

          await element.updateComplete;

          const productElement =
            element.shadowRoot!.querySelector('atomic-product')!;

          expect(productElement.imageSize).toBe(mockImageSize);
        });

        it('should receive correct #interactiveProduct', async () => {
          const mockProduct1 = {permanentid: 123};
          const mockProduct2 = {permanentid: 456};

          vi.spyOn(
            mocks.searchOrListingState,
            'products',
            'get'
          ).mockReturnValue([mockProduct1, mockProduct2]);

          const element = await setupElement({display});
          display === 'table' && setupTableTemplate(element);

          const mockInteractiveProduct = {
            beginDelayedSelect: vi.fn(),
            cancelPendingSelect: vi.fn(),
            select: vi.fn(),
            warningMessage: 'Test',
          };

          const interactiveProductSpy = vi
            .spyOn(element.searchOrListing, 'interactiveProduct')
            .mockReturnValueOnce(mockInteractiveProduct);

          await element.updateComplete;

          const productElements =
            element.shadowRoot!.querySelectorAll('atomic-product')!;

          expect(interactiveProductSpy).toHaveBeenCalledTimes(2);
          expect(interactiveProductSpy.mock.calls).toEqual([
            [{options: {product: mockProduct1}}],
            [{options: {product: mockProduct2}}],
          ]);
          expect(productElements[0].interactiveProduct).toEqual(
            mockInteractiveProduct
          );
          expect(productElements[1].interactiveProduct).toEqual(
            interactiveProductSpy.mock.results[1].value
          );
        });

        if (display === 'grid') {
          it('should receive correct #linkContent', async () => {
            const mockProduct1 = {permanentid: 123};
            const mockProduct2 = {permanentid: 456};

            vi.spyOn(
              mocks.searchOrListingState,
              'products',
              'get'
            ).mockReturnValue([mockProduct1, mockProduct2]);

            const element = await setupElement({display});

            const mockLinkTemplate = document.createDocumentFragment();
            mockLinkTemplate.appendChild(document.createElement('a'));

            const getLinkTemplateContentSpy = vi
              .spyOn(
                // @ts-expect-error - mocking return value of private method
                element.productTemplateProvider,
                'getLinkTemplateContent'
              )
              .mockReturnValueOnce(mockLinkTemplate);

            await element.updateComplete;

            const productElements =
              element.shadowRoot!.querySelectorAll('atomic-product')!;

            expect(getLinkTemplateContentSpy).toHaveBeenCalledTimes(2);
            expect(getLinkTemplateContentSpy.mock.calls).toEqual([
              [mockProduct1],
              [mockProduct2],
            ]);
            expect(productElements[0].linkContent).toBe(mockLinkTemplate);
            expect(productElements[1].linkContent).toBe(
              getLinkTemplateContentSpy.mock.results[1].value
            );
          });
        } else {
          it('should receive empty #linkContent', async () => {
            const mockProduct1 = {permanentid: 123};
            const mockProduct2 = {permanentid: 456};

            vi.spyOn(
              mocks.searchOrListingState,
              'products',
              'get'
            ).mockReturnValue([mockProduct1, mockProduct2]);

            const element = await setupElement({display});
            display === 'table' && setupTableTemplate(element);

            const mockEmptyLinkTemplate = document.createDocumentFragment();
            mockEmptyLinkTemplate.appendChild(document.createElement('empty'));

            const getEmptyLinkTemplateContentSpy = vi
              .spyOn(
                // @ts-expect-error - mocking return value of private method
                element.productTemplateProvider,
                'getEmptyLinkTemplateContent'
              )
              .mockReturnValueOnce(mockEmptyLinkTemplate);

            await element.updateComplete;

            const productElements =
              element.shadowRoot!.querySelectorAll('atomic-product')!;

            expect(getEmptyLinkTemplateContentSpy).toHaveBeenCalledTimes(2);
            expect(productElements[0].linkContent).toBe(mockEmptyLinkTemplate);
            expect(productElements[1].linkContent).toBe(
              getEmptyLinkTemplateContentSpy.mock.results[1].value
            );
          });
        }

        it('should receive correct #loadingFlag', async () => {
          const element = await setupElement({display});
          display === 'table' && setupTableTemplate(element);

          const mockLoadingFlag = 'mockLoadingFlag';

          // @ts-expect-error - mocking value of private property
          vi.spyOn(element, 'loadingFlag', 'get').mockReturnValue(
            mockLoadingFlag
          );

          await element.updateComplete;

          const productElement =
            element.shadowRoot!.querySelector('atomic-product')!;

          expect(productElement.loadingFlag).toBe(mockLoadingFlag);
        });

        it('should receive correct #product', async () => {
          const mockProduct1 = {permanentid: 123};
          const mockProduct2 = {permanentid: 456};

          vi.spyOn(
            mocks.searchOrListingState,
            'products',
            'get'
          ).mockReturnValue([mockProduct1, mockProduct2]);

          const element = await setupElement({
            display,
          });
          display === 'table' && setupTableTemplate(element);

          await element.updateComplete;

          const productElement =
            element.shadowRoot!.querySelectorAll('atomic-product')!;

          expect(productElement[0].product).toEqual(mockProduct1);
          expect(productElement[1].product).toEqual(mockProduct2);
        });

        it('should receive correct #renderingFunction', async () => {
          const element = await setupElement({display});
          display === 'table' && setupTableTemplate(element);

          const mockRenderingFunction = vi.mocked<ItemRenderingFunction>(
            () => '<atomic-table-element></atomic-table-element>'
          );

          element.setRenderFunction(mockRenderingFunction);

          await element.updateComplete;

          const productElement =
            element.shadowRoot!.querySelector('atomic-product')!;

          expect(productElement.renderingFunction).toEqual(
            mockRenderingFunction
          );
        });

        it('should receive correct correct #store', async () => {
          const element = await setupElement({display});
          display === 'table' && setupTableTemplate(element);

          const mockStore = vi.mocked<CommerceStore>({
            setLoadingFlag: vi.fn(),
            getUniqueIDFromEngine: vi.fn(),
            isMobile: vi.fn(),
            get: vi.fn(),
            set: vi.fn(),
            state: {
              loadingFlags: [],
              iconAssetsPath: '',
              mobileBreakpoint: '',
              activeProductChild: undefined,
              resultList: {
                focusOnFirstResultAfterNextSearch: vi.fn(),
                focusOnNextNewResult: vi.fn(),
              },
            },
            onChange: vi.fn(),
            unsetLoadingFlag: vi.fn(),
          });

          vi.spyOn(element.bindings, 'store', 'get').mockReturnValue(mockStore);

          await element.updateComplete;

          const productElement =
            element.shadowRoot!.querySelector('atomic-product')!;

          expect(productElement.store).toEqual(mockStore);
        });
      });
    };
  });
});
