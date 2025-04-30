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

  const parts = (element: AtomicCommerceProductList) => {
    const qs = (part: string, exact = true) =>
      element.shadowRoot?.querySelectorAll(
        `[part${exact ? '' : '*'}="${part}"]`
      );

    return {
      grid: {
        outline: qs('outline', false),
        resultList: qs('result-list'),
        resultListGridClickableContainer: qs(
          'result-list-grid-clickable-container',
          false
        ),
      },
      list: {
        outline: qs('outline'),
        resultList: qs('result-list'),
      },
      table: {
        resultTable: qs('result-table'),
        resultTableHeading: qs('result-table-heading'),
        resultTableHeadingRow: qs('result-table-heading-row'),
        resultTableHeadingCell: qs('result-table-heading-cell'),
        resultTableBody: qs('result-table-body'),
        resultTableRow: qs('result-table-row', false),
        resultTableRowEven: qs('result-table-row-even', false),
        resultTableRowOdd: qs('result-table-row-odd', false),
        resultTableCell: qs('result-table-cell'),
      },
    };
  };

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

  it('should initialize', async () => {
    const element = await setupElement();

    expect(element).toBeInstanceOf(AtomicCommerceProductList);
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

  it("should add 'atomic/selectChildProduct' event listener with correct callback", async () => {
    const element = await setupElement();

    const event = new CustomEvent('atomic/selectChildProduct', {
      detail: {child: 'childProductId'},
    });

    element.host.dispatchEvent(event);

    expect(element.searchOrListing.promoteChildToParent).toHaveBeenCalledWith(
      'childProductId'
    );
  });

  describe('when removed from the DOM', () => {
    it('should unsubscribe from summary controller state changes', async () => {
      const summarySubscribe = genericSubscribe;
      summary.mockReturnValue(
        buildFakeSummary({implementation: {subscribe: summarySubscribe}})
      );

      const element = await setupElement({interfaceType: 'product-listing'});
      element.remove();

      expect(summarySubscribe.mock.results[0].value).toHaveBeenCalledOnce();
    });

    it("should remove 'atomic/selectChildProduct' event listener", async () => {
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
      let element: AtomicCommerceProductList;

      beforeEach(async () => {
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

        const mockTableTemplate = document.createDocumentFragment();
        const atomicTableElement1 = document.createElement(
          'atomic-table-element'
        );
        atomicTableElement1.setAttribute('label', 'Label 1');
        const atomicTableElement2 = document.createElement(
          'atomic-table-element'
        );
        atomicTableElement2.setAttribute('label', 'Label 2');
        mockTableTemplate.appendChild(atomicTableElement1);
        mockTableTemplate.appendChild(atomicTableElement2);

        element = await setupElement({display: 'table'});

        vi.spyOn(
          // @ts-expect-error - mocking method on private property
          element.productTemplateProvider,
          'getTemplateContent'
        ).mockReturnValue(mockTableTemplate);

        element.requestUpdate();
        await element.updateComplete;
      });

      it('should render list wrapper & table with correct display class', async () => {
        await testRenderTableLayout();
      });

      it('should render 1 atomic-text with correct #value per atomic-table-element in template', async () => {
        const atomicTextElements =
          element.shadowRoot?.querySelectorAll('atomic-text');

        expect(atomicTextElements?.length).toBe(2);
        expect(atomicTextElements?.[0].value).toBe('Label 1');
        expect(atomicTextElements?.[1].value).toBe('Label 2');
      });

      it('should render 1 result-table part', async () => {
        const tableParts = parts(element).table.resultTable;

        expect(tableParts?.length).toBe(1);

        await expect
          .element(page.elementLocator(tableParts!.item(0)))
          .toBeInTheDocument();
      });

      it('should render 1 result-table-heading part', async () => {
        const tableHeadingPart = parts(element).table.resultTableHeading;

        expect(tableHeadingPart?.length).toBe(1);

        await expect
          .element(page.elementLocator(tableHeadingPart!.item(0)))
          .toBeInTheDocument();
      });

      it('should render 1 result-table-heading-row part', async () => {
        const tableHeadingRowParts = parts(element).table.resultTableHeadingRow;

        expect(tableHeadingRowParts?.length).toBe(1);

        await expect
          .element(page.elementLocator(tableHeadingRowParts!.item(0)))
          .toBeInTheDocument();
      });

      it('should render 1 result-table-heading-cell part per atomic-table-element in template', async () => {
        const tableHeadingCellParts =
          parts(element).table.resultTableHeadingCell;

        expect(tableHeadingCellParts?.length).toBe(2);

        await expect
          .element(page.elementLocator(tableHeadingCellParts!.item(0)))
          .toBeInTheDocument();

        await expect
          .element(page.elementLocator(tableHeadingCellParts!.item(1)))
          .toBeInTheDocument();
      });

      it('should render 1 result-table-body part', async () => {
        const tableBodyPart = parts(element).table.resultTableBody;

        expect(tableBodyPart?.length).toBe(1);

        await expect
          .element(page.elementLocator(tableBodyPart!.item(0)))
          .toBeInTheDocument();
      });

      it('should render 1 result-table-row part per product', async () => {
        const tableRowParts = parts(element).table.resultTableRow;

        expect(tableRowParts?.length).toBe(9);
      });

      it('should render floor(numberOfProducts / 2) result-table-row-even parts', async () => {
        const tableRowEvenParts = parts(element).table.resultTableRowEven;

        expect(tableRowEvenParts?.length).toBe(4);
      });

      it('should render ceil(numberOfProducts / 2) result-table-row-odd parts', async () => {
        const tableRowOddParts = parts(element).table.resultTableRowOdd;

        expect(tableRowOddParts?.length).toBe(5);
      });

      describe.each<{
        density: ItemDisplayDensity;
      }>([{density: 'comfortable'}, {density: 'compact'}, {density: 'normal'}])(
        'when #density is $density',
        ({density}) => {
          it('should render list wrapper & table with correct density class', async () => {
            await testRenderTableLayout({density});
          });
        }
      );

      describe.each<{imageSize: ItemDisplayImageSize}>([
        {imageSize: 'icon'},
        {imageSize: 'large'},
        {imageSize: 'none'},
        {imageSize: 'small'},
      ])('when #imageSize is $imageSize', ({imageSize}) => {
        it('should render list wrapper & table with correct image size class', async () => {
          await testRenderTableLayout({imageSize});
        });
      });

      testRenderAtomicProduct('table');
    });

    const testRenderTableLayout = async ({
      density,
      imageSize,
    }: {
      density?: ItemDisplayDensity;
      imageSize?: ItemDisplayImageSize;
    } = {}) => {
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

      const listWrapperElement =
        element.shadowRoot?.querySelectorAll('.list-wrapper');
      const resultTableElements = element.shadowRoot?.querySelectorAll('table');

      const expectedClass = [
        'display-table',
        density ? ` density-${density}` : '',
        imageSize ? ` image-${imageSize}` : '',
      ].join('');

      expect(listWrapperElement).toHaveLength(1);
      const listWrapperLocator = page.elementLocator(
        listWrapperElement!.item(0)
      );
      await expect.element(listWrapperLocator).toBeInTheDocument();
      await expect.element(listWrapperLocator).toHaveClass(expectedClass);
      expect(resultTableElements).toHaveLength(1);
      const resultTableLocator = page.elementLocator(
        resultTableElements!.item(0)
      );
      await expect.element(resultTableLocator).toBeInTheDocument();
      await expect.element(resultTableLocator).toHaveClass(expectedClass);
    };
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

      it('should render with correct display class', async () => {
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

  const testRenderAtomicProduct = (display: ItemDisplayLayout) => {
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

      display === 'table' && setupTableTemplate(element);

      await element.updateComplete;

      const renderedProductElements =
        element.shadowRoot?.querySelectorAll('atomic-product');

      expect(renderedProductElements).toHaveLength(numberOfProducts);
    });

    describe('when rendering atomic-product', () => {
      if (display === 'table') {
        it('should pass 1st product template to #content', async () => {
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

          vi.spyOn(
            // @ts-expect-error - mocking method on private property
            element.productTemplateProvider,
            'getTemplateContent'
          ).mockImplementation((product: Product) => {
            const mockTemplate = document.createDocumentFragment();
            const atomicTableElement = document.createElement(
              'atomic-table-element'
            );
            const content = document.createElement('div');
            content.textContent = `Hello from ${product.permanentid}`;
            atomicTableElement.appendChild(content);
            mockTemplate.appendChild(atomicTableElement);

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
          ).toBe('Hello from 123');
        });
      } else {
        it('should pass correct product template to #content', async () => {
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
      }
      it('should pass correct #density', async () => {
        const density = 'comfortable';
        const element = await setupElement({display, density});
        display === 'table' && setupTableTemplate(element);

        await element.updateComplete;

        const renderedProductElement =
          element.shadowRoot?.querySelector('atomic-product');

        expect(renderedProductElement?.density).toBe(density);
      });

      it('should pass correct #display', async () => {
        const element = await setupElement({display});
        display === 'table' && setupTableTemplate(element);

        await element.updateComplete;

        const renderedProductElement =
          element.shadowRoot?.querySelector('atomic-product');

        expect(renderedProductElement?.display).toBe(display);
      });

      it('should pass correct #imageSize', async () => {
        const imageSize = 'none';
        const element = await setupElement({display, imageSize});
        display === 'table' && setupTableTemplate(element);

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
        it('should pass product link template to #linkContent', async () => {
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
            element.searchOrListingState,
            'products',
            'get'
          ).mockReturnValue([mockProduct1, mockProduct2]);

          display === 'table' && setupTableTemplate(element);

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
        display === 'table' && setupTableTemplate(element);

        await element.updateComplete;

        const renderedProductElement =
          element.shadowRoot?.querySelector('atomic-product');

        // @ts-expect-error - testing private property
        expect(renderedProductElement?.loadingFlag).toBe(element.loadingFlag);
      });

      it('should pass correct #product', async () => {
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

      it('should pass correct #renderingFunction', async () => {
        const element = await setupElement({display});
        display === 'table' && setupTableTemplate(element);

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
        display === 'table' && setupTableTemplate(element);

        await element.updateComplete;

        const renderedProductElement =
          element.shadowRoot?.querySelector('atomic-product');

        expect(renderedProductElement?.store).toEqual(element.bindings.store);
      });
    });
  };
});
