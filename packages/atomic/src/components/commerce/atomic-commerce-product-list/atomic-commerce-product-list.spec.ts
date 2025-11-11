import {
  buildProductListing,
  buildSearch,
  type InteractiveProduct,
  type InteractiveProductProps,
  type Product,
} from '@coveo/headless/commerce';
import {html} from 'lit';
import {beforeEach, describe, expect, it, type MockInstance, vi} from 'vitest';
import {page} from 'vitest/browser';
import type {
  ItemDisplayDensity,
  ItemDisplayImageSize,
  ItemDisplayLayout,
} from '@/src/components/common/layout/item-layout-utils';
import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import {buildFakeProduct} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product';
import {buildFakeProductListing} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product-listing-controller';
import {buildFakeSearch} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/search-controller';
import {buildFakeSummary} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/summary-subcontroller';
import {genericSubscribe} from '@/vitest-utils/testing-helpers/fixtures/headless/common';
import {AtomicCommerceProductList} from './atomic-commerce-product-list';
import './atomic-commerce-product-list';

vi.mock('@/src/components/common/item-list/table-layout', {spy: true});
vi.mock('@/src/components/common/interface/store', {spy: true});
vi.mock('@coveo/headless/commerce', {spy: true});

describe('atomic-commerce-product-list', () => {
  const interactiveProduct = vi.fn();
  const promoteChildToParent = vi.fn();
  const summary = vi.fn();

  beforeEach(() => {
    summary.mockReturnValue(buildFakeSummary());

    vi.mocked(buildProductListing).mockImplementation(() =>
      buildFakeProductListing({
        implementation: {
          interactiveProduct,
          promoteChildToParent,
          summary,
        },
      })
    );

    vi.mocked(buildSearch).mockImplementation(() =>
      buildFakeSearch({
        implementation: {
          interactiveProduct,
          promoteChildToParent,
          summary,
        },
      })
    );
  });

  // #initialize =======================================================================================================

  it('should initialize', async () => {
    const element = await setupElement();

    expect(element).toBeInstanceOf(AtomicCommerceProductList);
  });

  it('should throw when #density prop is invalid', async () => {
    const element = await setupElement();

    expect(() => {
      element.setAttribute('density', 'invalid');
      element.initialize();
    }).toThrow();
  });

  it('should throw when #display prop is invalid', async () => {
    const element = await setupElement();

    expect(() => {
      element.setAttribute('display', 'invalid');
      element.initialize();
    }).toThrow();
  });

  it('should throw when #imageSize prop is invalid', async () => {
    const element = await setupElement();

    expect(() => {
      element.setAttribute('image-size', 'invalid');
      element.initialize();
    }).toThrow();
  });

  it('should throw when #numberOfPlaceholders prop is invalid', async () => {
    const element = await setupElement();

    expect(() => {
      element.setAttribute('number-of-placeholders', '-1');
      element.initialize();
    }).toThrow();
  });

  it('should not throw when all props are valid', async () => {
    const element = await setupElement();

    expect(() => element.initialize()).not.toThrow();
  });

  describe("when interface element type is 'product-listing'", () => {
    it('should initialize #searchOrListing as product listing controller', async () => {
      const element = await setupElement({interfaceType: 'product-listing'});

      const productListingController =
        vi.mocked(buildProductListing).mock.results[0].value;

      expect(element.searchOrListing).toBeDefined();
      expect(element.searchOrListing).toBe(productListingController);
    });

    it('should initialize #summary as product listing summary controller', async () => {
      const element = await setupElement({interfaceType: 'product-listing'});

      const summaryController =
        vi.mocked(buildProductListing).mock.results[0].value.summary.mock
          .results[0].value;

      expect(element.summary).toBeDefined();
      expect(element.summary).toBe(summaryController);
    });

    it('should subscribe to summary controller state changes', async () => {
      const summarySubscribeSpy = genericSubscribe;
      summary.mockReturnValue(
        buildFakeSummary({implementation: {subscribe: summarySubscribeSpy}})
      );

      await setupElement({interfaceType: 'product-listing'});

      expect(summarySubscribeSpy).toHaveBeenCalled();
    });
  });

  describe("when interface element type is 'search'", () => {
    let buildSearchSpy: MockInstance;

    beforeEach(async () => {
      buildSearchSpy = vi.mocked(buildSearch);
    });

    it('should initialize #searchOrListing as search controller', async () => {
      const element = await setupElement({interfaceType: 'search'});

      const searchController = buildSearchSpy.mock.results[0].value;

      expect(element.searchOrListing).toBeDefined();
      expect(element.searchOrListing).toBe(searchController);
    });

    it('should initialize #summary as search summary controller', async () => {
      const element = await setupElement({interfaceType: 'search'});

      const summaryController =
        buildSearchSpy.mock.results[0].value.summary.mock.results[0].value;

      expect(element.summary).toBeDefined();
      expect(element.summary).toBe(summaryController);
    });

    it('should subscribe to summary controller state changes', async () => {
      const summarySubscribeSpy = genericSubscribe;
      summary.mockReturnValue(
        buildFakeSummary({implementation: {subscribe: summarySubscribeSpy}})
      );

      await setupElement({interfaceType: 'search'});

      expect(summarySubscribeSpy).toHaveBeenCalled();
    });
  });

  it("should add 'atomic/selectChildProduct' event listener with correct callback", async () => {
    const element = await setupElement();

    const event = new CustomEvent('atomic/selectChildProduct', {
      detail: {child: 'childProductId'},
    });

    element.dispatchEvent(event);

    expect(element.searchOrListing.promoteChildToParent).toHaveBeenCalledWith(
      'childProductId'
    );
  });

  describe('#updated', () => {
    // biome-ignore lint/suspicious/noExplicitAny: <accessing private properties in tests>
    let element: any;

    beforeEach(async () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      element = await setupElement();
      element.isEveryProductReady = true;
    });

    it.each([
      {
        description:
          'should set #isEveryProductReady to false when transitioning from not loading to loading',
        oldState: false,
        newState: true,
        expectedResult: false,
      },
      {
        description:
          'should not change #isEveryProductReady when transitioning from loading to not loading',
        oldState: true,
        newState: false,
        expectedResult: true,
      },
      {
        description:
          'should not change #isEveryProductReady when staying in loading state',
        oldState: true,
        newState: true,
        expectedResult: true,
      },
      {
        description:
          'should not change #isEveryProductReady when staying in not loading state',
        oldState: false,
        newState: false,
        expectedResult: true,
      },
    ])('$description', ({oldState, newState, expectedResult}) => {
      element.searchOrListingState = {
        isLoading: newState,
        products: [buildFakeProduct()],
      };
      element.updated(
        new Map([['searchOrListingState', {isLoading: oldState}]])
      );

      expect(element.isEveryProductReady).toBe(expectedResult);
    });
  });

  describe('when removed from the DOM', () => {
    it('should unsubscribe from summary controller state changes', async () => {
      const summarySubscribe = genericSubscribe;
      summary.mockReturnValue(
        buildFakeSummary({implementation: {subscribe: summarySubscribe}})
      );

      const element = await setupElement({interfaceType: 'product-listing'});
      element.remove();

      const unsubscribe = summarySubscribe.mock.results[0].value;

      expect(unsubscribe).toHaveBeenCalled();
    });

    it("should remove 'atomic/selectChildProduct' event listener", async () => {
      const element = await setupElement();

      const removeEventListenerSpy = vi.spyOn(element, 'removeEventListener');

      element.remove();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'atomic/selectChildProduct',
        expect.any(Function)
      );
    });
  });

  it('should not render when bindings are undefined', async () => {
    const element = await setupElement();

    // @ts-expect-error - unsetting bindings for the sake of simplicity.
    element.bindings = undefined;

    // Must wait for update to complete after unsetting bindings.
    await element.updateComplete;

    const renderedElements = element.shadowRoot?.querySelectorAll('*');

    expect(renderedElements).toHaveLength(0);
  });

  it('should not render when there is an error', async () => {
    summary.mockReturnValue(buildFakeSummary({state: {hasError: true}}));

    vi.mocked(buildProductListing).mockImplementation(() =>
      buildFakeProductListing({
        implementation: {
          interactiveProduct,
          promoteChildToParent,
          summary,
        },
      })
    );

    const element = await setupElement();

    const renderedElements = element.shadowRoot?.querySelectorAll('*');

    expect(renderedElements).toHaveLength(0);
  });

  it('should not render when no template is registered', async () => {
    const element = await setupElement();

    //@ts-expect-error - setting private property: mocking the template provider would be complex.
    element.resultTemplateRegistered = false;

    // Must wait for update to complete after setting resultTemplateRegistered to false.
    await element.updateComplete;

    const renderedElements = element.shadowRoot?.querySelectorAll('*');

    expect(renderedElements).toHaveLength(0);
  });

  it('should not render when first request was executed & there are no products', async () => {
    summary.mockReturnValue(buildFakeSummary({state: {hasProducts: false}}));

    vi.mocked(buildProductListing).mockImplementation(() =>
      buildFakeProductListing({
        implementation: {
          interactiveProduct,
          promoteChildToParent,
          summary,
        },
      })
    );

    const element = await setupElement();

    const renderedElements = element.shadowRoot?.querySelectorAll('*');

    expect(renderedElements).toHaveLength(0);
  });

  it('should render empty slot when template has error', async () => {
    const element = await setupElement();

    //@ts-expect-error - setting private property: mocking the template provider would be complex.
    element.templateHasError = true;

    // Must wait for update to complete after setting templateHasError to true.
    await element.updateComplete;

    const renderedElements = element.shadowRoot?.querySelectorAll('*');

    expect(renderedElements).toHaveLength(1);
    expect(renderedElements?.item(0).tagName).toBe('SLOT');
    expect(renderedElements?.item(0).children).toHaveLength(0);
    expect(renderedElements?.item(0)).toBeInTheDocument();
  });

  it("should render 1 result-list-grid-clickable-container part per product when #display is 'grid' & app is loaded", async () => {
    vi.mocked(buildProductListing).mockImplementation(() =>
      buildFakeProductListing({
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

    const element = await setupElement({display: 'grid'});

    const resultListGridClickableContainerParts =
      getParts(element).gridOnly.resultListGridClickableContainer;

    expect(resultListGridClickableContainerParts).toHaveLength(3);
    await expect
      .element(
        page.elementLocator(resultListGridClickableContainerParts!.item(0))
      )
      .toBeInTheDocument();
    await expect
      .element(
        page.elementLocator(resultListGridClickableContainerParts!.item(1))
      )
      .toBeInTheDocument();
    await expect
      .element(
        page.elementLocator(resultListGridClickableContainerParts!.item(2))
      )
      .toBeInTheDocument();
  });

  describe.each<{display: ItemDisplayLayout}>([
    {display: 'grid'},
    {display: 'list'},
  ])('when #display is $display', ({display}) => {
    it('should not set the renderingFunction on the atomic product itself', async () => {
      const element = await setupElement({display});

      const mockRenderingFunction = vi.fn();

      element.setRenderFunction(mockRenderingFunction);

      element.requestUpdate();
      await element.updateComplete;

      const atomicProductElement =
        element.shadowRoot?.querySelector('atomic-product');

      expect(atomicProductElement?.renderingFunction).toBe(
        mockRenderingFunction
      );
    });

    it('should render correct # of atomic-result-placeholder when app is not loaded', async () => {
      const element = await setupElement({
        isAppLoaded: false,
        display,
        numberOfPlaceholders: 4,
      });

      const atomicResultPlaceholderElements =
        element.shadowRoot?.querySelectorAll('atomic-result-placeholder');

      expect(atomicResultPlaceholderElements).toHaveLength(4);
      expect(
        page.elementLocator(atomicResultPlaceholderElements!.item(0))
      ).toBeInTheDocument();
      expect(
        page.elementLocator(atomicResultPlaceholderElements!.item(1))
      ).toBeInTheDocument();
      expect(
        page.elementLocator(atomicResultPlaceholderElements!.item(2))
      ).toBeInTheDocument();
      expect(
        page.elementLocator(atomicResultPlaceholderElements!.item(3))
      ).toBeInTheDocument();
    });

    describe('when app is loaded', () => {
      it('should render list wrapper & root with correct display class', async () => {
        await renderListWrapperAndRootTestCase();
      });

      it('should render 1 result-list part', async () => {
        const resultListParts = getParts(
          await setupElement({
            display,
          })
        ).gridOrList.resultList;

        expect(resultListParts).toHaveLength(1);

        await expect
          .element(page.elementLocator(resultListParts!.item(0)))
          .toBeInTheDocument();
      });

      it('should render 1 outline part per product', async () => {
        vi.mocked(buildProductListing).mockImplementation(() =>
          buildFakeProductListing({
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

        const outlineParts = getParts(element).gridOrList.outline;

        expect(outlineParts).toHaveLength(3);
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
          it('should render list wrapper & root with correct density class', async () => {
            await renderListWrapperAndRootTestCase({density});
          });
        }
      );

      describe.each<{imageSize: ItemDisplayImageSize}>([
        {imageSize: 'icon'},
        {imageSize: 'large'},
        {imageSize: 'none'},
        {imageSize: 'small'},
      ])('when the #imageSize prop is $imageSize', ({imageSize}) => {
        it('should render list wrapper & root with correct image size class', async () => {
          await renderListWrapperAndRootTestCase({imageSize});
        });
      });

      renderAtomicProductTestCases(display);

      const renderListWrapperAndRootTestCase = async ({
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
          `display-${display}`,
          density ? ` density-${density}` : '',
          imageSize ? ` image-${imageSize}` : '',
        ].join('');

        expect(listWrapperElements).toHaveLength(1);
        await expect.element(listWrapperLocator).toBeInTheDocument();
        await expect.element(listWrapperLocator).toHaveClass(expectedClass);

        expect(listRootElements).toHaveLength(1);
        await expect.element(listRootLocator).toBeInTheDocument();
        await expect.element(listRootLocator).toHaveClass(expectedClass);
      };
    });
  });

  describe("when #display is 'table'", () => {
    it('should not set the renderingFunction on the atomic product itself', async () => {
      const element = await setupElement({display: 'table'});

      const mockRenderingFunction = vi.fn();

      element.setRenderFunction(mockRenderingFunction);

      element.requestUpdate();
      await element.updateComplete;

      const atomicProductElement =
        element.shadowRoot?.querySelector('atomic-product');

      expect(atomicProductElement?.renderingFunction).toBeUndefined();
    });

    it('should render 1 atomic-result-table-placeholder when app is not loaded', async () => {
      const element = await setupElement({
        display: 'table',
        isAppLoaded: false,
      });

      const atomicResultTablePlaceholderElements =
        element.shadowRoot?.querySelectorAll('atomic-result-table-placeholder');

      expect(atomicResultTablePlaceholderElements).toHaveLength(1);
      expect(
        page.elementLocator(atomicResultTablePlaceholderElements!.item(0))
      ).toBeInTheDocument();
    });

    describe('when app is loaded', () => {
      it('should render list wrapper & table with correct display class', async () => {
        await renderListWrapperAndTableTestCase();
      });

      it('should render 1 atomic-text with correct #value per atomic-table-element in template', async () => {
        const element = await setupElement({display: 'table'});

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

        vi.spyOn(
          // @ts-expect-error -  spying on private property: mocking the template provider would be complex.
          element.productTemplateProvider,
          'getTemplateContent'
        ).mockReturnValue(mockTableTemplate);

        // Must trigger update to get template content.
        element.requestUpdate();
        await element.updateComplete;

        const atomicTextElements =
          element.shadowRoot?.querySelectorAll('atomic-text');

        expect(atomicTextElements).toHaveLength(2);
        expect(atomicTextElements?.item(0).value).toBe('Label 1');
        expect(atomicTextElements?.item(1).value).toBe('Label 2');
        await expect
          .element(page.elementLocator(atomicTextElements!.item(0)))
          .toBeInTheDocument();
        await expect
          .element(page.elementLocator(atomicTextElements!.item(1)))
          .toBeInTheDocument();
      });

      it('should render 1 result-table part', async () => {
        const element = await setupElement({display: 'table'});

        const resultTableParts = getParts(element).table.resultTable;

        expect(resultTableParts).toHaveLength(1);
        await expect
          .element(page.elementLocator(resultTableParts!.item(0)))
          .toBeInTheDocument();
      });

      it('should render 1 result-table-heading part', async () => {
        const element = await setupElement({display: 'table'});

        const resultTableHeadingParts =
          getParts(element).table.resultTableHeading;

        expect(resultTableHeadingParts).toHaveLength(1);
        await expect
          .element(page.elementLocator(resultTableHeadingParts!.item(0)))
          .toBeInTheDocument();
      });

      it('should render 1 result-table-heading-row part', async () => {
        const element = await setupElement({display: 'table'});

        const resultTableHeadingRowParts =
          getParts(element).table.resultTableHeadingRow;

        expect(resultTableHeadingRowParts).toHaveLength(1);
        await expect
          .element(page.elementLocator(resultTableHeadingRowParts!.item(0)))
          .toBeInTheDocument();
      });

      it('should render 1 result-table-heading-cell part per atomic-table-element in template', async () => {
        const element = await setupElement({display: 'table'});

        const mockTableTemplate = document.createDocumentFragment();
        const atomicTableElement1 = document.createElement(
          'atomic-table-element'
        );
        const atomicTableElement2 = document.createElement(
          'atomic-table-element'
        );
        mockTableTemplate.appendChild(atomicTableElement1);
        mockTableTemplate.appendChild(atomicTableElement2);

        vi.spyOn(
          // @ts-expect-error - spying on private property: mocking the template provider would be complex.
          element.productTemplateProvider,
          'getTemplateContent'
        ).mockReturnValue(mockTableTemplate);

        // Must trigger update to get template content.
        element.requestUpdate();
        await element.updateComplete;

        const resultTableHeadingCellParts =
          getParts(element).table.resultTableHeadingCell;

        expect(resultTableHeadingCellParts).toHaveLength(2);
        await expect
          .element(page.elementLocator(resultTableHeadingCellParts!.item(0)))
          .toBeInTheDocument();
        await expect
          .element(page.elementLocator(resultTableHeadingCellParts!.item(1)))
          .toBeInTheDocument();
      });

      it('should render 1 result-table-body part', async () => {
        const element = await setupElement({display: 'table'});

        const resultTableBodyParts = getParts(element).table.resultTableBody;

        expect(resultTableBodyParts).toHaveLength(1);
        await expect
          .element(page.elementLocator(resultTableBodyParts!.item(0)))
          .toBeInTheDocument();
      });

      it('should render 1 result-table-row part per product', async () => {
        vi.mocked(buildProductListing).mockImplementation(() =>
          buildFakeProductListing({
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

        const element = await setupElement({display: 'table'});

        const resultTableRowParts = getParts(element).table.resultTableRow;

        expect(resultTableRowParts).toHaveLength(3);
        await expect
          .element(page.elementLocator(resultTableRowParts!.item(0)))
          .toBeInTheDocument();
        await expect
          .element(page.elementLocator(resultTableRowParts!.item(1)))
          .toBeInTheDocument();
        await expect
          .element(page.elementLocator(resultTableRowParts!.item(2)))
          .toBeInTheDocument();
      });

      it('should render floor(numberOfProducts / 2) result-table-row-even parts', async () => {
        vi.mocked(buildProductListing).mockImplementation(() =>
          buildFakeProductListing({
            implementation: {
              interactiveProduct,
              promoteChildToParent,
              summary,
            },
            state: {
              products: Array.from({length: 5}, (_, i) =>
                buildFakeProduct({permanentid: i.toString()})
              ),
            },
          })
        );

        const element = await setupElement({display: 'table'});

        const resultTableRowEvenParts =
          getParts(element).table.resultTableRowEven;

        expect(resultTableRowEvenParts).toHaveLength(2); // floor(5 / 2) = 2
        await expect
          .element(page.elementLocator(resultTableRowEvenParts!.item(0)))
          .toBeInTheDocument();
        await expect
          .element(page.elementLocator(resultTableRowEvenParts!.item(1)))
          .toBeInTheDocument();
      });

      it('should render ceil(numberOfProducts / 2) result-table-row-odd parts', async () => {
        vi.mocked(buildProductListing).mockImplementation(() =>
          buildFakeProductListing({
            implementation: {
              interactiveProduct,
              promoteChildToParent,
              summary,
            },
            state: {
              products: Array.from({length: 5}, (_, i) =>
                buildFakeProduct({permanentid: i.toString()})
              ),
            },
          })
        );

        const element = await setupElement({display: 'table'});

        const resultTableRowOddParts =
          getParts(element).table.resultTableRowOdd;

        expect(resultTableRowOddParts).toHaveLength(3); // ceil(5 / 2) = 3
        await expect
          .element(page.elementLocator(resultTableRowOddParts!.item(0)))
          .toBeInTheDocument();
        await expect
          .element(page.elementLocator(resultTableRowOddParts!.item(1)))
          .toBeInTheDocument();
        await expect
          .element(page.elementLocator(resultTableRowOddParts!.item(2)))
          .toBeInTheDocument();
      });

      describe.each<{
        density: ItemDisplayDensity;
      }>([{density: 'comfortable'}, {density: 'compact'}, {density: 'normal'}])(
        'when #density is $density',
        ({density}) => {
          it('should render list wrapper & table with correct density class', async () => {
            await renderListWrapperAndTableTestCase({density});
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
          await renderListWrapperAndTableTestCase({imageSize});
        });
      });

      renderAtomicProductTestCases('table');
    });

    const renderListWrapperAndTableTestCase = async ({
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

      const listWrapperElement =
        element.shadowRoot?.querySelectorAll('.list-wrapper');
      const listWrapperLocator = page.elementLocator(
        listWrapperElement!.item(0)
      );

      const tableElements = element.shadowRoot?.querySelectorAll('table');
      const tableLocator = page.elementLocator(tableElements!.item(0));

      const expectedClass = [
        'display-table',
        density ? ` density-${density}` : '',
        imageSize ? ` image-${imageSize}` : '',
      ].join('');

      expect(listWrapperElement).toHaveLength(1);
      await expect.element(listWrapperLocator).toBeInTheDocument();
      await expect.element(listWrapperLocator).toHaveClass(expectedClass);

      expect(tableElements).toHaveLength(1);
      await expect.element(tableLocator).toBeInTheDocument();
      await expect.element(tableLocator).toHaveClass(expectedClass);
    };
  });

  const renderAtomicProductTestCases = (display: ItemDisplayLayout) => {
    it('should render correct # of atomic-product', async () => {
      vi.mocked(buildProductListing).mockImplementation(() =>
        buildFakeProductListing({
          implementation: {
            interactiveProduct,
            promoteChildToParent,
            summary,
          },
          state: {
            products: Array.from({length: 9}, (_, i) =>
              buildFakeProduct({permanentid: i.toString()})
            ),
          },
        })
      );

      const element = await setupElement({
        display,
      });

      display === 'table' && (await setupTableTemplate(element));

      const atomicProductElements =
        element.shadowRoot?.querySelectorAll('atomic-product');

      expect(atomicProductElements).toHaveLength(9);
    });

    describe('when rendering atomic-product', () => {
      if (display === 'table') {
        it('should pass 1st product template to #content', async () => {
          const mockProduct1 = buildFakeProduct({permanentid: '123'});
          const mockProduct2 = buildFakeProduct({permanentid: '456'});

          vi.mocked(buildProductListing).mockImplementation(() =>
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
            // @ts-expect-error - spying on private property: mocking the template provider would be complex.
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

          // Must trigger update to get template content.
          element.requestUpdate();
          await element.updateComplete;

          const atomicProductElements =
            element.shadowRoot?.querySelectorAll('atomic-product');

          expect(
            atomicProductElements?.[0].content?.querySelector('div')
              ?.textContent
          ).toBe('Hello from 123');
          expect(
            atomicProductElements?.[1].content?.querySelector('div')
              ?.textContent
          ).toBe('Hello from 123');
        });
      } else {
        it('should pass correct product template to #content', async () => {
          const mockProduct1 = buildFakeProduct({permanentid: '123'});
          const mockProduct2 = buildFakeProduct({permanentid: '456'});

          vi.mocked(buildProductListing).mockImplementation(() =>
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
            // @ts-expect-error - spying on private property: mocking the template provider would be complex.
            element.productTemplateProvider,
            'getTemplateContent'
          ).mockImplementation((product: Product) => {
            const mockTemplate = document.createDocumentFragment();
            const content = document.createElement('div');
            content.textContent = `Hello from ${product.permanentid}`;
            mockTemplate.appendChild(content);
            return mockTemplate;
          });

          // Must trigger update to get template content.
          element.requestUpdate();
          await element.updateComplete;

          const atomicProductElements =
            element.shadowRoot?.querySelectorAll('atomic-product');

          expect(
            atomicProductElements?.[0].content?.querySelector('div')
              ?.textContent
          ).toBe('Hello from 123');
          expect(
            atomicProductElements?.[1].content?.querySelector('div')
              ?.textContent
          ).toBe('Hello from 456');
        });
      }
      it('should pass correct #density', async () => {
        const density = 'comfortable';
        const element = await setupElement({display, density});
        display === 'table' && (await setupTableTemplate(element));

        const atomicProductElement =
          element.shadowRoot?.querySelector('atomic-product');

        expect(atomicProductElement?.density).toBe(density);
      });

      it('should pass correct #display', async () => {
        const element = await setupElement({display});
        display === 'table' && (await setupTableTemplate(element));

        const atomicProductElement =
          element.shadowRoot?.querySelector('atomic-product');

        expect(atomicProductElement?.display).toBe(display);
      });

      it('should pass correct #imageSize', async () => {
        const imageSize = 'none';
        const element = await setupElement({display, imageSize});
        display === 'table' && (await setupTableTemplate(element));

        const renderedProductElement =
          element.shadowRoot?.querySelector('atomic-product');

        expect(renderedProductElement?.imageSize).toBe(imageSize);
      });

      it('should pass correct #interactiveProduct', async () => {
        const mockProduct1 = buildFakeProduct({permanentid: '123'});
        const mockProduct2 = buildFakeProduct({permanentid: '456'});

        interactiveProduct.mockImplementation(
          (props: InteractiveProductProps) => {
            return {
              warningMessage: props.options.product.permanentid,
            } as InteractiveProduct;
          }
        );

        vi.mocked(buildProductListing).mockImplementation(() =>
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

        display === 'table' && (await setupTableTemplate(element));

        interactiveProduct.mockClear();

        element.requestUpdate();
        await element.updateComplete;
        const atomicProductElements =
          element.shadowRoot?.querySelectorAll('atomic-product');

        expect(interactiveProduct).toHaveBeenCalledTimes(2);
        expect(interactiveProduct.mock.calls).toEqual([
          [{options: {product: mockProduct1}}],
          [{options: {product: mockProduct2}}],
        ]);
        expect(atomicProductElements?.[0].interactiveProduct).toBe(
          interactiveProduct.mock.results[0].value
        );
        expect(atomicProductElements?.[1].interactiveProduct).toBe(
          interactiveProduct.mock.results[1].value
        );
      });

      if (display === 'grid') {
        it('should pass product link template to #linkContent', async () => {
          const mockProduct1 = buildFakeProduct({permanentid: '123'});
          const mockProduct2 = buildFakeProduct({permanentid: '456'});

          vi.mocked(buildProductListing).mockImplementation(() =>
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
            // @ts-expect-error - spying on private property: mocking the template provider would be complex.
            element.productTemplateProvider,
            'getLinkTemplateContent'
          ).mockImplementation((product: Product) => {
            const mockLinkTemplate = document.createDocumentFragment();
            const content = document.createElement('a');
            content.href = `https://example.com/${product.permanentid}`;
            mockLinkTemplate.appendChild(content);

            return mockLinkTemplate;
          });

          // Must trigger update to get link template content.
          element.requestUpdate();
          await element.updateComplete;

          const atomicProductElements =
            element.shadowRoot?.querySelectorAll('atomic-product');

          expect(
            atomicProductElements?.[0].linkContent?.querySelector('a')?.href
          ).toBe('https://example.com/123');
          expect(
            atomicProductElements?.[1].linkContent?.querySelector('a')?.href
          ).toBe('https://example.com/456');
        });
      } else {
        it('should pass empty link template to #linkContent', async () => {
          const mockProduct1 = buildFakeProduct({permanentid: '123'});
          const mockProduct2 = buildFakeProduct({permanentid: '456'});

          const element = await setupElement({display});

          vi.spyOn(
            element.searchOrListingState,
            'products',
            'get'
          ).mockReturnValue([mockProduct1, mockProduct2]);

          const mockEmptyLinkTemplate = document.createDocumentFragment();
          mockEmptyLinkTemplate.appendChild(document.createElement('span'));

          vi.spyOn(
            // @ts-expect-error - spying on private property: mocking the template provider would be complex.
            element.productTemplateProvider,
            'getLinkTemplateContent'
          ).mockReturnValue(mockEmptyLinkTemplate);

          if (display === 'table') {
            await setupTableTemplate(element);
          } else {
            // Must trigger update to get link template content.
            element.requestUpdate();
            await element.updateComplete;
          }

          const atomicProductElements =
            element.shadowRoot?.querySelectorAll('atomic-product');

          expect(atomicProductElements?.[0].linkContent).toBe(
            mockEmptyLinkTemplate
          );
          expect(atomicProductElements?.[1].linkContent).toBe(
            mockEmptyLinkTemplate
          );
        });
      }

      it('should pass correct #loadingFlag', async () => {
        const element = await setupElement({display});
        display === 'table' && (await setupTableTemplate(element));

        const atomicProductElement =
          element.shadowRoot?.querySelector('atomic-product');

        // @ts-expect-error - testing private property
        expect(atomicProductElement?.loadingFlag).toBe(element.loadingFlag);
      });

      it('should pass correct #product', async () => {
        const mockProduct1 = buildFakeProduct({permanentid: '123'});
        const mockProduct2 = buildFakeProduct({permanentid: '456'});

        vi.mocked(buildProductListing).mockImplementation(() =>
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

        display === 'table' && (await setupTableTemplate(element));

        const atomicProductElement =
          element.shadowRoot?.querySelectorAll('atomic-product');

        expect(atomicProductElement?.[0].product).toBe(mockProduct1);
        expect(atomicProductElement?.[1].product).toBe(mockProduct2);
      });

      it('should pass correct #store', async () => {
        const element = await setupElement({display});
        display === 'table' && (await setupTableTemplate(element));

        const atomicProductElement =
          element.shadowRoot?.querySelector('atomic-product');

        expect(atomicProductElement?.store).toEqual(element.bindings.store);
      });
    });

    const setupTableTemplate = async (element: AtomicCommerceProductList) => {
      const mockTableTemplate = document.createDocumentFragment();
      mockTableTemplate.appendChild(
        document.createElement('atomic-table-element')
      );

      vi.spyOn(
        // @ts-expect-error - mocking method on private property
        element.productTemplateProvider,
        'getTemplateContent'
      ).mockReturnValue(mockTableTemplate);

      // Must trigger update to get template content.
      element.requestUpdate();
      await element.updateComplete;
    };
  };

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

  const getParts = (element: AtomicCommerceProductList) => {
    const qs = (part: string, exact = true) =>
      element.shadowRoot?.querySelectorAll(
        `[part${exact ? '' : '*'}="${part}"]`
      );

    return {
      gridOnly: {
        resultListGridClickableContainer: qs(
          'result-list-grid-clickable-container',
          false
        ),
      },
      gridOrList: {
        outline: qs('outline', false),
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
});
