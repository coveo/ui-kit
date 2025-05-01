import {fixtureCleanup} from '@/vitest-utils/testing-helpers/fixture-wrapper';
import {renderInAtomicCommerceRecommendationInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-recommendation-interface-fixture';
import {buildFakeProduct} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product';
import {buildFakeRecommendations} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/recommendations-controller';
import {
  buildRecommendations,
  InteractiveProduct,
  InteractiveProductProps,
  Product,
} from '@coveo/headless/commerce';
import {page} from '@vitest/browser/context';
import '@vitest/browser/matchers.d.ts';
import {html} from 'lit';
import {describe, expect, vi, beforeEach} from 'vitest';
import {
  ItemDisplayBasicLayout,
  ItemDisplayDensity,
  ItemDisplayImageSize,
} from '../../common/layout/display-options';
import './atomic-commerce-recommendation-list';
import {AtomicCommerceRecommendationList} from './atomic-commerce-recommendation-list';

vi.mock('@/src/components/common/interface/store', {spy: true});
vi.mock('@coveo/headless/commerce', {spy: true});

describe('AtomicCommerceRecommendationList', () => {
  const interactiveProduct = vi.fn();
  const promoteChildToParent = vi.fn();
  const summary = vi.fn();

  // TODO: test parts!
  // const parts = (element: AtomicCommerceRecommendationList) => {
  //   const qs = (part: string, exact = true) =>
  //     element.shadowRoot?.querySelectorAll(
  //       `[part${exact ? '' : '*'}="${part}"]`
  //     );

  //   return {
  //     grid: {
  //       outline: qs('outline', false),
  //       resultList: qs('result-list'),
  //       resultListGridClickableContainer: qs(
  //         'result-list-grid-clickable-container',
  //         false
  //       ),
  //     },
  //     list: {
  //       outline: qs('outline'),
  //       resultList: qs('result-list'),
  //     },
  //   };
  // };

  beforeEach(() => {
    fixtureCleanup();

    vi.mocked(buildRecommendations).mockReturnValue(
      buildFakeRecommendations({
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
    isAppLoaded = true,
  }: {
    display?: ItemDisplayBasicLayout;
    density?: ItemDisplayDensity;
    imageSize?: ItemDisplayImageSize;
    isAppLoaded?: boolean;
  } = {}) => {
    const {element} =
      await renderInAtomicCommerceRecommendationInterface<AtomicCommerceRecommendationList>(
        {
          template: html`<atomic-commerce-recommendation-list
            .display=${display}
            .density=${density}
            .imageSize=${imageSize}
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

    return element;
  };

  it('should initialize', async () => {
    const element = await setupElement();

    expect(element).toBeInstanceOf(AtomicCommerceRecommendationList);
  });

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

  it('when #productsPerPage is invalid, should throw', async () => {
    const element = await setupElement();

    expect(() => {
      element.setAttribute('products-per-page', 'invalid');
      element.initialize();
    }).toThrow();
  });

  it('when all props are valid, should not throw', async () => {
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
  });

  it('when bindings are undefined, should not render', async () => {
    const element = await setupElement();

    // @ts-expect-error - setting private property for the sake of simplicity
    element.bindings = undefined;

    await element.updateComplete;

    const renderedElements = element.shadowRoot?.querySelectorAll('*');

    expect(renderedElements).toHaveLength(0);
  });

  it('when there is an error, should not render', async () => {
    vi.mocked(buildRecommendations).mockReturnValue(
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

    console.log(renderedElements);

    expect(renderedElements).toHaveLength(1);
  });

  it('when no template is registered, should not render', async () => {
    const element = await setupElement();

    //@ts-expect-error - setting private property for the sake of simplicity
    element.productTemplateRegistered = false;
    await element.updateComplete;

    const renderedElements = element.shadowRoot?.querySelectorAll('*');

    expect(renderedElements).toHaveLength(0);
  });

  it('when first request was executed & there are no products, should not render', async () => {
    vi.mocked(buildRecommendations).mockReturnValue(
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

  describe.each<{display: ItemDisplayBasicLayout}>([
    {display: 'grid'},
    {display: 'list'},
  ])('when #display is $display', ({display}) => {
    // it('when app is not loaded, should render correct # of placeholders', async () => {
    //   const numberOfPlaceholders = 12;

    //   const element = await setupElement({
    //     isAppLoaded: false,
    //     display,
    //   });

    //   await element.updateComplete;

    //   const placeholderElements = element.shadowRoot?.querySelectorAll(
    //     'atomic-result-placeholder'
    //   );

    //   expect(placeholderElements).toHaveLength(numberOfPlaceholders);
    // });

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

        await element.updateComplete;

        const listWrapperElement =
          element.shadowRoot?.querySelector('.list-wrapper');
        const listWrapperLocator = page.elementLocator(listWrapperElement!);

        // TODO: test lengths
        const listRootElement = listWrapperElement!.querySelector(
          '[part="result-list"]'
        )!;
        const listRootLocator = page.elementLocator(listRootElement);

        const expectedClass = [
          'display-grid',
          density ? ` density-${density}` : '',
          imageSize ? ` image-${imageSize}` : '',
        ].join('');

        await expect.element(listWrapperLocator).toBeInTheDocument();
        await expect.element(listWrapperLocator).toHaveClass(expectedClass);
        await expect.element(listRootLocator).toBeInTheDocument();
        await expect.element(listRootLocator).toHaveClass(expectedClass);
      };

      it('should render with list wrapper & root with correct display class', async () => {
        await testWrapperRendering();
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
    });
  });

  const testRenderAtomicProduct = (display: ItemDisplayBasicLayout) => {
    it('should render correct # of atomic-product', async () => {
      const numberOfProducts = 9;

      vi.mocked(buildRecommendations).mockReturnValue(
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

        vi.mocked(buildRecommendations).mockReturnValue(
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
          // @ts-expect-error - mocking method on private property
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

        vi.mocked(buildRecommendations).mockReturnValue(
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

          vi.mocked(buildRecommendations).mockReturnValue(
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
            // @ts-expect-error - mocking return value of private method
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
          const mockProduct1 = {
            permanentid: 123,
          } as unknown as Product;
          const mockProduct2 = {
            permanentid: 456,
          } as unknown as Product;

          const element = await setupElement({display});

          vi.spyOn(
            element.recommendationsState,
            'products',
            'get'
          ).mockReturnValue([mockProduct1, mockProduct2]);

          const mockEmptyLinkTemplate = document.createDocumentFragment();
          mockEmptyLinkTemplate.appendChild(document.createElement('span'));

          vi.spyOn(
            // @ts-expect-error - mocking method on private property
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

        // @ts-expect-error - testing private property
        expect(renderedProductElement?.loadingFlag).toBe(element.loadingFlag);
      });

      it('should pass correct #product', async () => {
        const mockProduct1 = buildFakeProduct({permanentid: '123'});
        const mockProduct2 = buildFakeProduct({permanentid: '456'});

        vi.mocked(buildRecommendations).mockReturnValue(
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
