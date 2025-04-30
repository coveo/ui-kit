import {fixtureCleanup} from '@/vitest-utils/testing-helpers/fixture-wrapper';
import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import {buildFakeProduct} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product';
import {buildFakeProductListing} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product-listing-controller';
import {buildFakeSearch} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/search-controller';
import {buildFakeSummary} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/summary-subcontroller';
import {genericSubscribe} from '@/vitest-utils/testing-helpers/fixtures/headless/common';
import {
  buildProductListing,
  buildSearch,
  InteractiveProduct,
  InteractiveProductProps,
  Product,
} from '@coveo/headless/commerce';
import {page} from '@vitest/browser/context';
import '@vitest/browser/matchers.d.ts';
import {html} from 'lit';
import {describe, expect, MockInstance, vi} from 'vitest';
import {ItemRenderingFunction} from '../../common/item-list/item-list-common-lit';
import {
  ItemDisplayDensity,
  ItemDisplayImageSize,
  ItemDisplayLayout,
} from '../../common/layout/display-options';
import './atomic-commerce-product-list';
import {AtomicCommerceProductList} from './atomic-commerce-product-list';

vi.mock('@/src/components/common/interface/store', {spy: true});
vi.mock('@coveo/headless/commerce', {spy: true});

describe('AtomicCommerceProductList', () => {
  const interactiveProduct = vi.fn();
  const promoteChildToParent = vi.fn();
  const summary = vi.fn();

  beforeEach(() => {
    fixtureCleanup();

    summary.mockReturnValue(buildFakeSummary());

    vi.mocked(buildProductListing).mockReturnValue(
      buildFakeProductListing({
        implementation: {
          interactiveProduct,
          promoteChildToParent,
          summary,
        },
      })
    );

    vi.mocked(buildSearch).mockReturnValue(
      buildFakeSearch({
        implementation: {
          interactiveProduct,
          promoteChildToParent,
          summary,
        },
      })
    );
  });

  const setupElement = async ({
    display = 'grid',
    density = 'normal',
    imageSize = 'small',
    numberOfPlaceholders = 24,
    isAppLoaded = true,
    interfaceType = 'product-listing',
  }: {
    display?: ItemDisplayLayout;
    density?: ItemDisplayDensity;
    imageSize?: ItemDisplayImageSize;
    numberOfPlaceholders?: number;
    isAppLoaded?: boolean;
    interfaceType?: 'product-listing' | 'search';
  } = {}) => {
    const {element} =
      await renderInAtomicCommerceInterface<AtomicCommerceProductList>({
        template: html`<atomic-commerce-product-list
          .display=${display}
          .density=${density}
          .imageSize=${imageSize}
          .numberOfPlaceholders=${numberOfPlaceholders}
        ></atomic-commerce-product-list>`,
        selector: 'atomic-commerce-product-list',
        bindings: (bindings) => {
          bindings.interfaceElement.type = interfaceType;
          bindings.store.state.loadingFlags = isAppLoaded
            ? []
            : ['loading-flag'];
          bindings.engine.logger = {error: vi.fn()} as never;
          return bindings;
        },
      });

    return element;
  };

  describe('#constructor', () => {
    it('should create instance', async () => {
      const element = await setupElement();

      expect(element).toBeInstanceOf(AtomicCommerceProductList);
    });
  });

  describe('#initialize', () => {
    it('when #density is invalid, should throw', async () => {
      const element = await setupElement();

      expect(() => {
        element.setAttribute('density', 'invalid');
        element.initialize();
      }).toThrow();
    });

    it('when #display is invalid, should throw', async () => {
      const element = await setupElement();

      expect(() => {
        element.setAttribute('display', 'invalid');
        element.initialize();
      }).toThrow();
    });

    it('when #imageSize is invalid, should throw', async () => {
      const element = await setupElement();

      expect(() => {
        element.setAttribute('image-size', 'invalid');
        element.initialize();
      }).toThrow();
    });

    it('when #numberOfPlaceholders is invalid, should throw', async () => {
      const element = await setupElement();

      expect(() => {
        element.setAttribute('number-of-placeholders', '-1');
        element.initialize();
      }).toThrow();
    });

    it('when all props are valid, should not throw', async () => {
      const element = await setupElement();

      expect(() => element.initialize()).not.toThrow();
    });

    describe("when interface element type is 'product-listing'", () => {
      let buildProductListingSpy: MockInstance;

      beforeEach(() => {
        buildProductListingSpy = vi.mocked(buildProductListing);
      });

      it('should initialize #searchOrListing as product listing controller', async () => {
        const element = await setupElement({
          interfaceType: 'product-listing',
        });

        expect(buildProductListingSpy).toHaveBeenCalledOnce();
        expect(buildProductListingSpy).toHaveBeenCalledWith(
          element.bindings.engine
        );
        expect(element.searchOrListing).toBe(
          buildProductListingSpy.mock.results[0].value
        );
      });

      it('should initialize #summary as product listing summary controller', async () => {
        const element = await setupElement({interfaceType: 'product-listing'});

        expect(
          buildProductListingSpy.mock.results[0].value.summary
        ).toHaveBeenCalledOnce();
        expect(element.summary).toBe(
          buildProductListingSpy.mock.results[0].value.summary.mock.results[0]
            .value
        );
      });

      it('should subscribe to summary controller state changes', async () => {
        const summarySubscribe = genericSubscribe;
        summary.mockReturnValue(
          buildFakeSummary({implementation: {subscribe: summarySubscribe}})
        );

        await setupElement({interfaceType: 'product-listing'});

        expect(summarySubscribe).toHaveBeenCalled();
      });
    });

    describe("when interface element type is 'search'", () => {
      let buildSearchSpy: MockInstance;
      beforeEach(() => {
        buildSearchSpy = vi.mocked(buildSearch);
      });

      it('should initialize #searchOrListing as search controller', async () => {
        const element = await setupElement({interfaceType: 'search'});

        expect(buildSearchSpy).toHaveBeenCalledOnce();
        expect(buildSearchSpy).toHaveBeenCalledWith(element.bindings.engine);
        expect(element.searchOrListing).toBe(
          buildSearchSpy.mock.results[0].value
        );
      });

      it('should initialize #summary as search summary controller', async () => {
        const element = await setupElement({interfaceType: 'search'});

        expect(
          buildSearchSpy.mock.results[0].value.summary
        ).toHaveBeenCalledOnce();
        expect(element.summary).toBe(
          buildSearchSpy.mock.results[0].value.summary.mock.results[0].value
        );
      });

      it('should subscribe to summary controller state changes', async () => {
        const summarySubscribe = genericSubscribe;
        summary.mockReturnValue(
          buildFakeSummary({implementation: {subscribe: summarySubscribe}})
        );

        await setupElement({interfaceType: 'search'});

        expect(summarySubscribe).toHaveBeenCalled();
      });
    });

    it('should add select child product event listener with correct callback', async () => {
      const element = await setupElement();

      const event = new CustomEvent('atomic/selectChildProduct', {
        detail: {child: 'childProductId'},
      });

      element.host.dispatchEvent(event);

      expect(element.searchOrListing.promoteChildToParent).toHaveBeenCalledWith(
        'childProductId'
      );
    });
  });

  describe('#disconnectedCallback', () => {
    it('should unsubscribe from summary controller state changes', async () => {
      const summarySubscribe = genericSubscribe;
      summary.mockReturnValue(
        buildFakeSummary({implementation: {subscribe: summarySubscribe}})
      );

      const element = await setupElement({interfaceType: 'product-listing'});
      element.remove();

      expect(summarySubscribe.mock.results[0].value).toHaveBeenCalledOnce();
    });

    it('should remove select child product event listener', async () => {
      const element = await setupElement();

      const removeEventListenerSpy = vi.spyOn(
        element.host,
        'removeEventListener'
      );

      element.remove();

      expect(removeEventListenerSpy).toHaveBeenCalledOnce();
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'atomic/selectChildProduct',
        expect.any(Function)
      );
    });
  });

  describe('#render', () => {
    it('when bindings are undefined, should not render', async () => {
      const element = await setupElement();

      // @ts-expect-error - setting private property for the sake of simplicity
      element.bindings = undefined;

      await element.updateComplete;

      const renderedElements = element.shadowRoot?.querySelectorAll('*');

      expect(renderedElements).toHaveLength(0);
    });

    it('when there is an error, should not render', async () => {
      summary.mockReturnValue(buildFakeSummary({state: {hasError: true}}));

      vi.mocked(buildProductListing).mockReturnValue(
        buildFakeProductListing({
          implementation: {
            interactiveProduct,
            promoteChildToParent,
            summary,
          },
        })
      );

      const element = await setupElement();

      await element.updateComplete;

      const renderedElements = element.shadowRoot?.querySelectorAll('*');

      expect(renderedElements).toHaveLength(0);
    });

    it('when no template is registered, should not render', async () => {
      const element = await setupElement();

      //@ts-expect-error - setting private property for the sake of simplicity
      element.resultTemplateRegistered = false;
      await element.updateComplete;

      const renderedElements = element.shadowRoot?.querySelectorAll('*');

      expect(renderedElements).toHaveLength(0);
    });

    it('when first request was executed & there are no products, should not render', async () => {
      summary.mockReturnValue(buildFakeSummary({state: {hasProducts: false}}));

      vi.mocked(buildProductListing).mockReturnValue(
        buildFakeProductListing({
          implementation: {
            interactiveProduct,
            promoteChildToParent,
            summary,
          },
        })
      );

      const element = await setupElement();

      await element.updateComplete;

      const renderedElements = element.shadowRoot?.querySelectorAll('*');

      expect(renderedElements).toHaveLength(0);
    });

    describe('when rendering', () => {
      it('when template has error, should render empty slot', async () => {
        const element = await setupElement();

        //@ts-expect-error - setting private property for the sake of simplicity
        element.templateHasError = true;

        await element.updateComplete;

        const renderedElements = element.shadowRoot?.querySelectorAll('*');
        const renderedSlotElement = element.shadowRoot?.querySelector('slot');

        expect(renderedElements).toHaveLength(1);
        expect(renderedSlotElement).toBeTruthy();
        expect(renderedSlotElement?.children).toHaveLength(0);
      });

      describe("when #display is 'table'", () => {
        it('when app is not loaded, should render 1 placeholder', async () => {
          const element = await setupElement({
            display: 'table',
            isAppLoaded: false,
          });

          await element.updateComplete;

          const placeholderElements = element.shadowRoot?.querySelectorAll(
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

            element.requestUpdate();
            await element.updateComplete;

            const resultTableElement = element.shadowRoot?.querySelector(
              '[part="result-table"]'
            );
            const resultTableLocator = page.elementLocator(resultTableElement!);

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
            {density: 'comfortable'},
            {density: 'compact'},
            {density: 'normal'},
          ])('when #density is $density', ({density}) => {
            it('should have correct density class', async () => {
              await testWrapperRendering({density});
            });
          });

          describe.each<{imageSize: ItemDisplayImageSize}>([
            {imageSize: 'icon'},
            {imageSize: 'large'},
            {imageSize: 'none'},
            {imageSize: 'small'},
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

          const placeholderElements = element.shadowRoot?.querySelectorAll(
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
              element.shadowRoot?.querySelector('.list-wrapper');
            const listWrapperLocator = page.elementLocator(listWrapperElement!);

            const listRootElement = listWrapperElement!.querySelector(
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

          describe.each<{
            density: ItemDisplayDensity;
          }>([
            {density: 'comfortable'},
            {density: 'compact'},
            {density: 'normal'},
          ])('when the #density prop is $density', ({density}) => {
            it('should have correct density class', async () => {
              await testWrapperRendering({density});
            });
          });

          describe.each<{imageSize: ItemDisplayImageSize}>([
            {imageSize: 'icon'},
            {imageSize: 'large'},
            {imageSize: 'none'},
            {imageSize: 'small'},
          ])('when the #imageSize prop is $imageSize', ({imageSize}) => {
            it('should have correct image size class', async () => {
              await testWrapperRendering({imageSize});
            });
          });

          atomicProductRenderingTestCases(display);
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

        element.requestUpdate();
      };

      it('should render correct # of atomic-product', async () => {
        const numberOfProducts = 9;

        vi.mocked(buildProductListing).mockReturnValue(
          buildFakeProductListing({
            implementation: {
              interactiveProduct,
              promoteChildToParent,
              summary,
            },
            state: {
              products: Array.from({length: numberOfProducts}, (_, i) =>
                buildFakeProduct({permanentid: i.toString()})
              ),
            },
          })
        );

        const element = await setupElement({
          display,
        });

        vi.spyOn(
          element.searchOrListingState,
          'products',
          'get'
        ).mockReturnValue(
          Array.from(
            {length: numberOfProducts},
            (_, i) =>
              ({
                permanentid: i + 1,
              }) as unknown as Product
          )
        );
        display === 'table' && setupTableTemplate(element);

        await element.updateComplete;

        const renderedProductElements =
          element.shadowRoot?.querySelectorAll('atomic-product');

        expect(renderedProductElements).toHaveLength(numberOfProducts);
      });

      describe('each atomic-product', () => {
        if (display === 'table') {
          it('should receive correct table template #content', async () => {
            const mockProduct1 = buildFakeProduct({permanentid: '123'});
            const mockProduct2 = buildFakeProduct({permanentid: '456'});

            vi.mocked(buildProductListing).mockReturnValue(
              buildFakeProductListing({
                implementation: {
                  interactiveProduct,
                  promoteChildToParent,
                  summary,
                },
                state: {
                  products: [mockProduct1, mockProduct2],
                },
              })
            );

            const element = await setupElement({display});

            const mockTemplate = document.createDocumentFragment();
            const atomicTableElement = document.createElement(
              'atomic-table-element'
            );
            atomicTableElement.appendChild(document.createElement('div'));
            mockTemplate.appendChild(atomicTableElement);

            const getTemplateContentSpy = vi.spyOn(
              // @ts-expect-error - mocking return value of method on private property
              element.productTemplateProvider,
              'getTemplateContent'
            );

            getTemplateContentSpy.mockReturnValueOnce(mockTemplate);

            element.requestUpdate();
            await element.updateComplete;

            const renderedProductElements =
              element.shadowRoot?.querySelectorAll('atomic-product');

            expect(getTemplateContentSpy.mock.calls[0]).toEqual([mockProduct1]);
            expect(renderedProductElements?.[0].content).toBe(
              getTemplateContentSpy.mock.results[0].value.querySelector(
                'atomic-table-element'
              )
            );
            // Only the template content of the first product is used in table layout
            expect(renderedProductElements?.[1].content).toBe(
              getTemplateContentSpy.mock.results[0].value.querySelector(
                'atomic-table-element'
              )
            );
          });
        } else {
          it('should receive correct template #content', async () => {
            const mockProduct1 = buildFakeProduct({permanentid: '123'});
            const mockProduct2 = buildFakeProduct({permanentid: '456'});

            vi.mocked(buildProductListing).mockReturnValue(
              buildFakeProductListing({
                implementation: {
                  interactiveProduct,
                  promoteChildToParent,
                  summary,
                },
                state: {
                  products: [mockProduct1, mockProduct2],
                },
              })
            );

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

            element.requestUpdate();
            await element.updateComplete;

            const renderedProductElements =
              element.shadowRoot?.querySelectorAll('atomic-product');

            expect(getTemplateContentSpy).toHaveBeenCalledTimes(2);
            expect(getTemplateContentSpy.mock.calls).toEqual([
              [mockProduct1],
              [mockProduct2],
            ]);
            expect(renderedProductElements?.[0].content).toBe(mockTemplate);
            expect(renderedProductElements?.[1].content).toBe(
              getTemplateContentSpy.mock.results[1].value
            );
          });
        }
        it('should receive correct #density', async () => {
          const density = 'comfortable';
          const element = await setupElement({display, density});
          display === 'table' && setupTableTemplate(element);

          await element.updateComplete;

          const renderedProductElement =
            element.shadowRoot?.querySelector('atomic-product');

          expect(renderedProductElement?.density).toBe(density);
        });

        it('should receive correct #display', async () => {
          const element = await setupElement({display});
          display === 'table' && setupTableTemplate(element);

          await element.updateComplete;

          const renderedProductElement =
            element.shadowRoot?.querySelector('atomic-product');

          expect(renderedProductElement?.display).toBe(display);
        });

        it('should receive correct #imageSize', async () => {
          const imageSize = 'none';
          const element = await setupElement({display, imageSize});
          display === 'table' && setupTableTemplate(element);

          await element.updateComplete;

          const renderedProductElement =
            element.shadowRoot?.querySelector('atomic-product');

          expect(renderedProductElement?.imageSize).toBe(imageSize);
        });

        it('should receive correct #interactiveProduct', async () => {
          const mockProduct1 = buildFakeProduct({permanentid: '123'});
          const mockProduct2 = buildFakeProduct({permanentid: '456'});

          interactiveProduct.mockImplementation(
            (props: InteractiveProductProps) => {
              return {
                warningMessage: props.options.product.permanentid,
              } as InteractiveProduct;
            }
          );

          vi.mocked(buildProductListing).mockReturnValue(
            buildFakeProductListing({
              implementation: {
                interactiveProduct,
                promoteChildToParent,
                summary,
              },
              state: {
                products: [mockProduct1, mockProduct2],
              },
            })
          );

          const element = await setupElement({display});

          display === 'table' && setupTableTemplate(element);

          await element.updateComplete;

          const renderedProductElements =
            element.shadowRoot?.querySelectorAll('atomic-product');

          expect(interactiveProduct).toHaveBeenCalledTimes(2);
          expect(interactiveProduct.mock.calls).toEqual([
            [{options: {product: mockProduct1}}],
            [{options: {product: mockProduct2}}],
          ]);
          expect(renderedProductElements?.[0].interactiveProduct).toBe(
            interactiveProduct.mock.results[0].value
          );
          expect(renderedProductElements?.[1].interactiveProduct).toBe(
            interactiveProduct.mock.results[1].value
          );
        });

        if (display === 'grid') {
          it('should receive correct #linkContent', async () => {
            const mockProduct1 = buildFakeProduct({permanentid: '123'});
            const mockProduct2 = buildFakeProduct({permanentid: '456'});

            vi.mocked(buildProductListing).mockReturnValue(
              buildFakeProductListing({
                implementation: {
                  interactiveProduct,
                  promoteChildToParent,
                  summary,
                },
                state: {
                  products: [mockProduct1, mockProduct2],
                },
              })
            );

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

            element.requestUpdate();
            await element.updateComplete;

            const renderedProductElements =
              element.shadowRoot?.querySelectorAll('atomic-product');

            expect(getLinkTemplateContentSpy).toHaveBeenCalledTimes(2);
            expect(getLinkTemplateContentSpy.mock.calls).toEqual([
              [mockProduct1],
              [mockProduct2],
            ]);
            expect(renderedProductElements?.[0].linkContent).toBe(
              mockLinkTemplate
            );
            expect(renderedProductElements?.[1].linkContent).toBe(
              getLinkTemplateContentSpy.mock.results[1].value
            );
          });
        } else {
          it('should receive empty #linkContent', async () => {
            const mockProduct1 = {
              permanentid: 123,
            } as unknown as Product;
            const mockProduct2 = {
              permanentid: 456,
            } as unknown as Product;

            const element = await setupElement({display});

            vi.spyOn(
              element.searchOrListingState,
              'products',
              'get'
            ).mockReturnValue([mockProduct1, mockProduct2]);

            display === 'table' && setupTableTemplate(element);

            const mockEmptyLinkTemplate = document.createDocumentFragment();
            mockEmptyLinkTemplate.appendChild(document.createElement('empty'));

            const getEmptyLinkTemplateContentSpy = vi
              .spyOn(
                // @ts-expect-error - mocking return value of private method
                element.productTemplateProvider,
                'getEmptyLinkTemplateContent'
              )
              .mockReturnValue(mockEmptyLinkTemplate);

            element.requestUpdate();
            await element.updateComplete;

            const renderedProductElements =
              element.shadowRoot?.querySelectorAll('atomic-product');

            expect(getEmptyLinkTemplateContentSpy).toHaveBeenCalledTimes(2);
            expect(renderedProductElements?.[0].linkContent).toBe(
              mockEmptyLinkTemplate
            );
            // getEmptyLinkTemplateContent accepts no arguments and always returns the same value
            expect(renderedProductElements?.[1].linkContent).toBe(
              mockEmptyLinkTemplate
            );
          });
        }

        it('should receive correct #loadingFlag', async () => {
          const element = await setupElement({display});
          display === 'table' && setupTableTemplate(element);

          await element.updateComplete;

          const renderedProductElement =
            element.shadowRoot?.querySelector('atomic-product');

          // @ts-expect-error - testing private property
          expect(renderedProductElement?.loadingFlag).toBe(element.loadingFlag);
        });

        it('should receive correct #product', async () => {
          const mockProduct1 = buildFakeProduct({permanentid: '123'});
          const mockProduct2 = buildFakeProduct({permanentid: '456'});

          vi.mocked(buildProductListing).mockReturnValue(
            buildFakeProductListing({
              implementation: {
                interactiveProduct,
                promoteChildToParent,
                summary,
              },
              state: {
                products: [mockProduct1, mockProduct2],
              },
            })
          );

          const element = await setupElement({
            display,
          });

          display === 'table' && setupTableTemplate(element);

          await element.updateComplete;

          const renderedProductElement =
            element.shadowRoot?.querySelectorAll('atomic-product');

          expect(renderedProductElement?.[0].product).toBe(mockProduct1);
          expect(renderedProductElement?.[1].product).toBe(mockProduct2);
        });

        it('should receive correct #renderingFunction', async () => {
          const element = await setupElement({display});
          display === 'table' && setupTableTemplate(element);

          const mockRenderingFunction = vi.mocked<ItemRenderingFunction>(
            () => '<atomic-table-element></atomic-table-element>'
          );

          element.setRenderFunction(mockRenderingFunction);

          element.requestUpdate();
          await element.updateComplete;

          const renderedProductElement =
            element.shadowRoot?.querySelector('atomic-product');

          expect(renderedProductElement?.renderingFunction).toBe(
            mockRenderingFunction
          );
        });

        it('should receive correct correct #store', async () => {
          const element = await setupElement({display});
          display === 'table' && setupTableTemplate(element);

          await element.updateComplete;

          const renderedProductElement =
            element.shadowRoot?.querySelector('atomic-product');

          expect(renderedProductElement?.store).toEqual(element.bindings.store);
        });
      });
    };
  });
});
