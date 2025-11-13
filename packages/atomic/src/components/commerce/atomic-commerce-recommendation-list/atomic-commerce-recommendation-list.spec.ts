import {
  buildRecommendations,
  type InteractiveProduct,
  type InteractiveProductProps,
  type Product,
} from '@coveo/headless/commerce';
import {html} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import type {
  ItemDisplayBasicLayout,
  ItemDisplayDensity,
  ItemDisplayImageSize,
} from '@/src/components/common/layout/item-layout-utils.js';
import {renderInAtomicCommerceRecommendationInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-recommendation-interface-fixture.js';
import {buildFakeProduct} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product.js';
import {buildFakeRecommendations} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/recommendations-controller.js';
import {buildFakeSummary} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/summary-subcontroller.js';
import {genericSubscribe} from '@/vitest-utils/testing-helpers/fixtures/headless/common.js';
import {AtomicCommerceRecommendationList} from './atomic-commerce-recommendation-list';
import './atomic-commerce-recommendation-list';

vi.mock('@/src/components/common/interface/store', {spy: true});
vi.mock('@coveo/headless/commerce', {spy: true});

describe('atomic-commerce-recommendation-list', () => {
  const interactiveProduct = vi.fn();
  const promoteChildToParent = vi.fn();
  const summary = vi.fn();

  beforeEach(() => {
    summary.mockReturnValue(buildFakeSummary());

    vi.mocked(buildRecommendations).mockImplementation(() =>
      buildFakeRecommendations({
        implementation: {
          interactiveProduct,
          promoteChildToParent,
          summary,
        },
      })
    );
  });

  it('should initialize', async () => {
    const element = await setupElement();

    expect(element).toBeInstanceOf(AtomicCommerceRecommendationList);
  });

  it('should throw when #density is invalid', async () => {
    const element = await setupElement();

    expect(() => {
      element.setAttribute('density', 'invalid');
      element.initialize();
    }).toThrow();
  });

  it('should throw when #display is invalid', async () => {
    const element = await setupElement();

    expect(() => {
      element.setAttribute('display', 'invalid');
      element.initialize();
    }).toThrow();
  });

  it('should throw when #imageSize is invalid', async () => {
    const element = await setupElement();

    expect(() => {
      element.setAttribute('image-size', 'invalid');
      element.initialize();
    }).toThrow();
  });

  it('should throw when #productsPerPage is invalid', async () => {
    const element = await setupElement();

    expect(() => {
      element.setAttribute('products-per-page', 'invalid');
      element.initialize();
    }).toThrow();
  });

  it('should not throw when all props are valid', async () => {
    const element = await setupElement();

    expect(() => element.initialize()).not.toThrow();
  });

  it('should initialize #recommendations as recommendations controller', async () => {
    const buildRecommendationsSpy = vi.mocked(buildRecommendations);

    const element = await setupElement();

    expect(buildRecommendationsSpy).toHaveBeenCalledOnce();
    expect(buildRecommendationsSpy).toHaveBeenCalledWith(
      element.bindings.engine,
      {
        options: {
          slotId: 'Recommendation',
          productId: undefined,
        },
      }
    );
    expect(element.recommendations).toBe(
      buildRecommendationsSpy.mock.results[0].value
    );
  });

  it('should initialize #summary as summary subcontroller', async () => {
    const buildRecommendationsSpy = vi.mocked(buildRecommendations);

    const element = await setupElement();

    expect(buildRecommendationsSpy).toHaveBeenCalledOnce();
    expect(buildRecommendationsSpy).toHaveBeenCalledWith(
      element.bindings.engine,
      {
        options: {
          slotId: 'Recommendation',
          productId: undefined,
        },
      }
    );
    expect(element.summary).toBe(
      buildRecommendationsSpy.mock.results[0].value.summary()
    );
  });

  it("should add 'atomic/selectChildProduct' event listener with correct callback", async () => {
    const element = await setupElement();

    const event = new CustomEvent('atomic/selectChildProduct', {
      detail: {child: 'childProductId'},
    });

    element.dispatchEvent(event);

    expect(element.recommendations.promoteChildToParent).toHaveBeenCalledWith(
      'childProductId'
    );
  });

  describe('when removed from the DOM', () => {
    it("should remove 'atomic/selectChildProduct' event listener", async () => {
      const element = await setupElement();

      const removeEventListenerSpy = vi.spyOn(element, 'removeEventListener');

      element.remove();

      expect(removeEventListenerSpy).toHaveBeenCalledOnce();
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'atomic/selectChildProduct',
        expect.any(Function)
      );
    });

    it('should unsubscribe from summary controller state changes', async () => {
      const summarySubscribe = genericSubscribe;
      summary.mockReturnValue(
        buildFakeSummary({implementation: {subscribe: summarySubscribe}})
      );

      const element = await setupElement();
      element.remove();

      const unsubscribe = summarySubscribe.mock.results[0].value;

      expect(unsubscribe).toHaveBeenCalled();
    });
  });

  it('should not render when bindings are undefined', async () => {
    const element = await setupElement();

    // @ts-expect-error - unsetting bindings for the sake of simplicity.
    element.bindings = undefined;

    await element.updateComplete;

    const renderedElements = element.shadowRoot?.querySelectorAll('*');

    expect(renderedElements).toHaveLength(0);
  });

  it('should not render when there is an error', async () => {
    vi.mocked(buildRecommendations).mockImplementation(() =>
      buildFakeRecommendations({
        implementation: {
          interactiveProduct,
          promoteChildToParent,
          summary,
        },
      })
    );

    const element = await setupElement();

    element.error = new Error('Test error');
    await element.updateComplete;

    const renderedElements = element.shadowRoot?.querySelectorAll('*');

    expect(renderedElements).toHaveLength(1);
  });

  it('should not render when no template is registered', async () => {
    const element = await setupElement();

    //@ts-expect-error - setting private property: mocking the template provider would be complex.
    element.productTemplateRegistered = false;
    await element.updateComplete;

    const renderedElements = element.shadowRoot?.querySelectorAll('*');

    expect(renderedElements).toHaveLength(0);
  });

  it('should not render when first request was executed & there are no products', async () => {
    vi.mocked(buildRecommendations).mockImplementation(() =>
      buildFakeRecommendations({
        implementation: {
          interactiveProduct,
          promoteChildToParent,
          summary,
        },
        state: {
          products: [],
        },
      })
    );

    const element = await setupElement();

    await element.updateComplete;

    const renderedElements = element.shadowRoot?.querySelectorAll('*');

    expect(renderedElements).toHaveLength(0);
  });

  it('should render empty slot when template has error', async () => {
    const element = await setupElement();

    //@ts-expect-error - setting private property: mocking the template provider would be complex.
    element.templateHasError = true;

    await element.updateComplete;

    const renderedElements = element.shadowRoot?.querySelectorAll('*');
    const renderedSlotElement = element.shadowRoot?.querySelector('slot');

    expect(renderedElements).toHaveLength(1);
    expect(renderedSlotElement).toBeTruthy();
    expect(renderedSlotElement?.children).toHaveLength(0);
  });

  describe.each<{display: ItemDisplayBasicLayout}>([
    {display: 'grid'},
    {display: 'list'},
  ])('when #display is $display', ({display}) => {
    describe('when app is loaded', () => {
      const testWrapperRendering = async ({
        density,
        imageSize,
      }: {
        density?: ItemDisplayDensity;
        imageSize?: ItemDisplayImageSize;
      } = {}) => {
        const element = await setupElement({
          display,
          ...(density && {density}),
          ...(imageSize && {imageSize}),
        });

        const listWrapperElements =
          element.shadowRoot?.querySelectorAll('.list-wrapper');
        const listWrapperLocator = page.elementLocator(
          listWrapperElements!.item(0)
        );

        const listRootElements =
          element.shadowRoot?.querySelectorAll('.list-root');
        const listRootLocator = page.elementLocator(listRootElements!.item(0));

        const expectedClass = [
          'display-grid',
          density ? ` density-${density}` : '',
          imageSize ? ` image-${imageSize}` : '',
        ].join('');

        expect(listWrapperElements?.length).toBe(1);
        await expect.element(listWrapperLocator).toBeInTheDocument();
        await expect.element(listWrapperLocator).toHaveClass(expectedClass);

        expect(listRootElements?.length).toBe(1);
        await expect.element(listRootLocator).toBeInTheDocument();
        await expect.element(listRootLocator).toHaveClass(expectedClass);
      };

      it('should render with list wrapper & root with correct display class', async () => {
        await testWrapperRendering();
      });

      it('should render 1 result-list part', async () => {
        const resultListParts = getParts(
          await setupElement({
            display,
          })
        )[display].resultList;

        expect(resultListParts?.length).toBe(1);

        await expect
          .element(page.elementLocator(resultListParts!.item(0)))
          .toBeInTheDocument();
      });

      it('should render 1 outline part per product', async () => {
        vi.mocked(buildRecommendations).mockImplementation(() =>
          buildFakeRecommendations({
            implementation: {
              interactiveProduct,
              promoteChildToParent,
              summary,
            },
            state: {
              products: Array.from({length: 3}, (_, i) =>
                buildFakeProduct({permanentid: i.toString()})
              ),
            },
          })
        );

        const element = await setupElement({
          display,
        });

        const outlineParts = getParts(element).grid.outline;

        expect(outlineParts?.length).toBe(3);
        await expect
          .element(page.elementLocator(outlineParts!.item(0)))
          .toBeInTheDocument();
        await expect
          .element(page.elementLocator(outlineParts!.item(1)))
          .toBeInTheDocument();
        await expect
          .element(page.elementLocator(outlineParts!.item(2)))
          .toBeInTheDocument();
      });

      describe.each<{
        density: ItemDisplayDensity;
      }>([{density: 'comfortable'}, {density: 'compact'}, {density: 'normal'}])(
        'when the #density prop is $density',
        ({density}) => {
          it('should render with correct density class', async () => {
            await testWrapperRendering({density});
          });
        }
      );

      describe.each<{imageSize: ItemDisplayImageSize}>([
        {imageSize: 'icon'},
        {imageSize: 'large'},
        {imageSize: 'none'},
        {imageSize: 'small'},
      ])('when the #imageSize prop is $imageSize', ({imageSize}) => {
        it('should render with correct image size class', async () => {
          await testWrapperRendering({imageSize});
        });
      });

      testRenderAtomicProduct(display);

      describe('when rendering part attributes', () => {
        it('should render the result-list part', async () => {
          const element = await setupElement({display});
          const parts = getParts(element)[display];
          const resultList = parts.resultList?.item(0);
          expect(resultList).toBeTruthy();
          expect(resultList).toHaveAttribute('part', 'result-list');
        });

        if (display === 'grid') {
          it('should render the result-list-grid-clickable-container part for each product', async () => {
            const element = await setupElement({display});
            const parts = getParts(element).grid;
            const containers = parts.resultListGridClickableContainer;
            expect(containers?.length).toBe(3);
            for (let i = 0; i < containers!.length; i++) {
              expect(containers!.item(i)).toHaveAttribute(
                'part',
                'result-list-grid-clickable-container outline'
              );
            }
          });
        }

        it('should have the correct part for the label', async () => {
          const element = await setupElement({display});
          const parts = getParts(element).grid;
          const label = parts.label?.item(0);
          expect(label).toBeTruthy();
          expect(label).toHaveAttribute('part', 'label');
        });

        it('should have the correct part for the carousel previous button', async () => {
          const element = await setupElement({display, productsPerPage: 2});
          const parts = getParts(element)[display];
          const previousButton = parts.previousButton?.item(0);
          expect(previousButton).toBeTruthy();
          expect(previousButton).toHaveAttribute('part', 'previous-button');
        });
        it('should have the correct part for the carousel next button', async () => {
          const element = await setupElement({display, productsPerPage: 2});
          const parts = getParts(element)[display];
          const nextButton = parts.nextButton?.item(0);
          expect(nextButton).toBeTruthy();
          expect(nextButton).toHaveAttribute('part', 'next-button');
        });

        it('should have the correct part for the carousel indicators', async () => {
          const element = await setupElement({display, productsPerPage: 2});
          const parts = getParts(element)[display];
          const indicators = parts.indicators?.item(0);
          expect(indicators).toBeTruthy();
          expect(indicators).toHaveAttribute('part', 'indicators');
        });

        it('should have the correct part for the carousel indicator', async () => {
          const element = await setupElement({display, productsPerPage: 2});
          const parts = getParts(element)[display];
          const indicator = parts.indicator?.item(0);
          expect(indicator).toBeTruthy();
          expect(indicator).toHaveAttribute('part', 'indicator');
        });

        it('should have the correct part for the active carousel indicator', async () => {
          vi.mocked(buildRecommendations).mockImplementation(() =>
            buildFakeRecommendations({
              implementation: {
                interactiveProduct,
                promoteChildToParent,
                summary,
              },
              state: {
                products: Array.from({length: 6}, (_, i) =>
                  buildFakeProduct({permanentid: i.toString()})
                ),
              },
            })
          );
          const element = await setupElement({display});
          const parts = getParts(element)[display];
          const activeIndicator = parts.activeIndicator?.item(0);
          expect(activeIndicator).toBeTruthy();
          expect(activeIndicator).toHaveAttribute(
            'part',
            'indicator active-indicator'
          );
        });
      });
    });
  });

  const testRenderAtomicProduct = (display: ItemDisplayBasicLayout) => {
    it('should render correct # of atomic-product', async () => {
      const numberOfProducts = 9;

      vi.mocked(buildRecommendations).mockImplementation(() =>
        buildFakeRecommendations({
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
        productsPerPage: numberOfProducts,
      });

      await element.updateComplete;

      const renderedProductElements =
        element.shadowRoot?.querySelectorAll('atomic-product');

      expect(renderedProductElements).toHaveLength(numberOfProducts);
    });

    describe('when rendering atomic-product', () => {
      it('should pass correct product template to #content', async () => {
        const mockProduct1 = buildFakeProduct({permanentid: '123'});
        const mockProduct2 = buildFakeProduct({permanentid: '456'});

        vi.mocked(buildRecommendations).mockImplementation(() =>
          buildFakeRecommendations({
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

        vi.spyOn(
          // @ts-expect-error -  spying on private property: mocking the template provider would be complex.
          element.productTemplateProvider,
          'getTemplateContent'
        ).mockImplementation((product: Product) => {
          const mockTemplate = document.createDocumentFragment();
          const content = document.createElement('div');
          content.textContent = `Hello from ${product.permanentid}`;
          mockTemplate.appendChild(content);
          return mockTemplate;
        });

        element.requestUpdate();
        await element.updateComplete;

        const renderedProductElements =
          element.shadowRoot?.querySelectorAll('atomic-product');

        expect(
          renderedProductElements?.[0].content?.querySelector('div')
            ?.textContent
        ).toBe('Hello from 123');
        expect(
          renderedProductElements?.[1].content?.querySelector('div')
            ?.textContent
        ).toBe('Hello from 456');
      });

      it('should pass correct #density', async () => {
        const density = 'comfortable';
        const element = await setupElement({display, density});

        await element.updateComplete;

        const renderedProductElement =
          element.shadowRoot?.querySelector('atomic-product');

        expect(renderedProductElement?.density).toBe(density);
      });

      it('should pass correct #display', async () => {
        const element = await setupElement({display});

        await element.updateComplete;

        const renderedProductElement =
          element.shadowRoot?.querySelector('atomic-product');

        expect(renderedProductElement?.display).toBe(display);
      });

      it('should pass correct #imageSize', async () => {
        const imageSize = 'none';
        const element = await setupElement({display, imageSize});

        await element.updateComplete;

        const renderedProductElement =
          element.shadowRoot?.querySelector('atomic-product');

        expect(renderedProductElement?.imageSize).toBe(imageSize);
      });

      it('should pass correct #interactiveProduct', async () => {
        const mockProduct1 = buildFakeProduct({permanentid: '123'});
        const mockProduct2 = buildFakeProduct({permanentid: '456'});

        interactiveProduct.mockReset();
        interactiveProduct.mockImplementation(
          (props: InteractiveProductProps) => {
            return {
              warningMessage: props.options.product.permanentid,
            } as InteractiveProduct;
          }
        );

        vi.mocked(buildRecommendations).mockImplementation(() =>
          buildFakeRecommendations({
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

        interactiveProduct.mockClear();

        element.requestUpdate();
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
        it('should pass product link template to #linkContent', async () => {
          const mockProduct1 = buildFakeProduct({permanentid: '123'});
          const mockProduct2 = buildFakeProduct({permanentid: '456'});

          vi.mocked(buildRecommendations).mockImplementation(() =>
            buildFakeRecommendations({
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

          vi.spyOn(
            // @ts-expect-error -  spying on private property: mocking the template provider would be complex.
            element.productTemplateProvider,
            'getLinkTemplateContent'
          ).mockImplementation((product: Product) => {
            const mockLinkTemplate = document.createDocumentFragment();
            const content = document.createElement('a');
            content.href = `https://example.com/${product.permanentid}`;
            mockLinkTemplate.appendChild(content);

            return mockLinkTemplate;
          });

          element.requestUpdate();
          await element.updateComplete;

          const renderedProductElements =
            element.shadowRoot?.querySelectorAll('atomic-product');

          expect(
            renderedProductElements?.[0].linkContent?.querySelector('a')?.href
          ).toBe('https://example.com/123');
          expect(
            renderedProductElements?.[1].linkContent?.querySelector('a')?.href
          ).toBe('https://example.com/456');
        });
      } else {
        it('should pass empty link template to #linkContent', async () => {
          const mockProduct1 = buildFakeProduct({permanentid: '123'});
          const mockProduct2 = buildFakeProduct({permanentid: '456'});

          const element = await setupElement({display});

          vi.spyOn(
            element.recommendationsState,
            'products',
            'get'
          ).mockReturnValue([mockProduct1, mockProduct2]);

          const mockEmptyLinkTemplate = document.createDocumentFragment();
          mockEmptyLinkTemplate.appendChild(document.createElement('span'));

          vi.spyOn(
            // @ts-expect-error -  spying on private property: mocking the template provider would be complex.
            element.productTemplateProvider,
            'getEmptyLinkTemplateContent'
          ).mockReturnValue(mockEmptyLinkTemplate);

          element.requestUpdate();
          await element.updateComplete;

          const renderedProductElements =
            element.shadowRoot?.querySelectorAll('atomic-product');

          expect(renderedProductElements?.[0].linkContent).toBe(
            mockEmptyLinkTemplate
          );

          expect(renderedProductElements?.[1].linkContent).toBe(
            mockEmptyLinkTemplate
          );
        });
      }

      it('should pass correct #loadingFlag', async () => {
        const element = await setupElement({display});

        await element.updateComplete;

        const renderedProductElement =
          element.shadowRoot?.querySelector('atomic-product');

        // @ts-expect-error -  spying on private property: mocking the template provider would be complex.
        expect(renderedProductElement?.loadingFlag).toBe(element.loadingFlag);
      });

      it('should pass correct #product', async () => {
        const mockProduct1 = buildFakeProduct({permanentid: '123'});
        const mockProduct2 = buildFakeProduct({permanentid: '456'});

        vi.mocked(buildRecommendations).mockImplementation(() =>
          buildFakeRecommendations({
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

        await element.updateComplete;

        const renderedProductElement =
          element.shadowRoot?.querySelectorAll('atomic-product');

        expect(renderedProductElement?.[0].product).toBe(mockProduct1);
        expect(renderedProductElement?.[1].product).toBe(mockProduct2);
      });

      it('should pass correct #renderingFunction', async () => {
        const element = await setupElement({display});

        const mockRenderingFunction = vi.fn();

        element.setRenderFunction(mockRenderingFunction);

        element.requestUpdate();
        await element.updateComplete;

        const renderedProductElement =
          element.shadowRoot?.querySelector('atomic-product');

        expect(renderedProductElement?.renderingFunction).toBe(
          mockRenderingFunction
        );
      });

      it('should pass correct #store', async () => {
        const element = await setupElement({display});

        await element.updateComplete;

        const renderedProductElement =
          element.shadowRoot?.querySelector('atomic-product');

        expect(renderedProductElement?.store).toEqual(element.bindings.store);
      });
    });
  };
});
const setupElement = async ({
  display = 'grid',
  density = 'normal',
  imageSize = 'small',
  productsPerPage = 3,
  isAppLoaded = true,
  slotId = 'Recommendation',
}: {
  display?: ItemDisplayBasicLayout;
  density?: ItemDisplayDensity;
  imageSize?: ItemDisplayImageSize;
  productsPerPage?: number;
  isAppLoaded?: boolean;
  slotId?: string;
} = {}) => {
  const {element} =
    await renderInAtomicCommerceRecommendationInterface<AtomicCommerceRecommendationList>(
      {
        template: html`<atomic-commerce-recommendation-list
            .display=${display}
            .density=${density}
            .imageSize=${imageSize}
            .productsPerPage=${productsPerPage}
            .slotId=${slotId}
          ></atomic-commerce-recommendation-list>`,
        selector: 'atomic-commerce-recommendation-list',
        bindings: (bindings) => {
          bindings.store.state.loadingFlags = isAppLoaded
            ? []
            : ['loading-flag'];
          bindings.engine.logger = {error: vi.fn()} as never;
          return bindings;
        },
      }
    );

  await element.updateComplete;
  return element;
};

const getParts = (element: AtomicCommerceRecommendationList) => {
  const qs = (part: string, exact = true) =>
    element.shadowRoot?.querySelectorAll(`[part${exact ? '' : '*'}="${part}"]`);

  return {
    grid: {
      outline: qs('outline', false),
      resultList: qs('result-list'),
      resultListGridClickableContainer: qs(
        'result-list-grid-clickable-container',
        false
      ),
      resultListGridClickable: qs('result-list-grid-clickable'),
      label: qs('label'),
      previousButton: qs('previous-button'),
      nextButton: qs('next-button'),
      indicators: qs('indicators'),
      indicator: qs('indicator'),
      activeIndicator: qs('active-indicator', false),
    },
    list: {
      outline: qs('outline'),
      resultList: qs('result-list'),
      label: qs('label'),
      previousButton: qs('previous-button'),
      nextButton: qs('next-button'),
      indicators: qs('indicators'),
      indicator: qs('indicator'),
      activeIndicator: qs('active-indicator', false),
    },
  };
};
