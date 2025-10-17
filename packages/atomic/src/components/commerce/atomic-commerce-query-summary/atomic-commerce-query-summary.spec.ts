import {
  buildProductListing,
  buildSearch,
  type ProductListingSummaryState,
  type SearchSummaryState,
  type Summary,
} from '@coveo/headless/commerce';
import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {AriaLiveRegionController} from '@/src/utils/accessibility-utils';
import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import {buildFakeCommerceEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/engine';
import {buildFakeProductListing} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product-listing-controller';
import {buildFakeSearch} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/search-controller';
import {buildFakeSummary} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/summary-subcontroller';
import type {AtomicCommerceQuerySummary} from './atomic-commerce-query-summary';
import './atomic-commerce-query-summary';

vi.mock('@coveo/headless/commerce', {spy: true});

describe('atomic-commerce-query-summary', () => {
  const mockedEngine = buildFakeCommerceEngine();
  let mockedQuerySummary: Summary<
    SearchSummaryState | ProductListingSummaryState
  >;
  const renderQuerySummary = async ({
    interfaceElementType = 'product-listing',
    querySummaryState = {},
  }: {
    interfaceElementType?: 'product-listing' | 'search';
    querySummaryState?:
      | Partial<SearchSummaryState>
      | Partial<ProductListingSummaryState>;
  } = {}) => {
    mockedQuerySummary = buildFakeSummary({state: querySummaryState});

    vi.mocked(buildProductListing).mockReturnValue(
      buildFakeProductListing({
        implementation: {
          summary: () => mockedQuerySummary,
        },
      })
    );
    vi.mocked(buildSearch).mockReturnValue(
      buildFakeSearch({
        implementation: {
          summary: () => mockedQuerySummary as Summary<SearchSummaryState>,
        },
      })
    );

    const {element} =
      await renderInAtomicCommerceInterface<AtomicCommerceQuerySummary>({
        template: html`<atomic-commerce-query-summary></atomic-commerce-query-summary>`,
        selector: 'atomic-commerce-query-summary',
        bindings: (bindings) => {
          bindings.interfaceElement.type = interfaceElementType;
          bindings.engine = mockedEngine;

          return bindings;
        },
      });

    return {
      element,
      placeholder: element.shadowRoot!.querySelector('[part="placeholder"]'),
      container: element.shadowRoot!.querySelector('[part="container"]'),
      parts: (element: AtomicCommerceQuerySummary) => {
        const qs = (part: string) =>
          element.shadowRoot?.querySelector(`[part*="${part}"]`);
        return {
          container: qs('container'),
          highlight: qs('highlight'),
          query: qs('query'),
          placeholder: qs('placeholder'),
        };
      },
    };
  };

  it('should call buildProductListing when interfaceElement.type is "product-listing"', async () => {
    await renderQuerySummary({interfaceElementType: 'product-listing'});
    expect(buildProductListing).toHaveBeenCalledWith(mockedEngine);
  });

  it('should call buildSearch when interfaceElement.type is "search"', async () => {
    await renderQuerySummary({interfaceElementType: 'search'});
    expect(buildSearch).toHaveBeenCalledWith(mockedEngine);
  });

  it('should call summary on this.listingOrSearchSummary', async () => {
    const {element} = await renderQuerySummary();
    expect(element.listingOrSearchSummary).toBe(mockedQuerySummary);
  });

  it('should render nothing when hasError is true', async () => {
    const {element} = await renderQuerySummary({
      querySummaryState: {
        hasError: true,
      },
    });
    expect(element).toBeEmptyDOMElement();
  });

  it('should render nothing when hasProducts is false and firstRequestExecuted is true', async () => {
    const {element} = await renderQuerySummary({
      querySummaryState: {
        hasProducts: false,
        firstRequestExecuted: true,
      },
    });
    expect(element).toBeEmptyDOMElement();
  });

  it('should render a placeholder when firstRequestExecuted is false', async () => {
    const {placeholder} = await renderQuerySummary({
      querySummaryState: {
        firstRequestExecuted: false,
      },
    });

    expect(placeholder).toBeInTheDocument();
  });

  describe('when hasError is false & hasProducts is true & firstRequestExecuted is true', () => {
    it('should render correctly', async () => {
      const {element} = await renderQuerySummary({
        querySummaryState: {
          hasProducts: true,
          firstRequestExecuted: true,
          hasError: false,
        },
      });
      expect(element).toBeDefined();
    });

    it('should call buildProductListing when interfaceElement.type is "product-listing"', async () => {
      await renderQuerySummary({
        interfaceElementType: 'product-listing',
        querySummaryState: {
          hasProducts: true,
          firstRequestExecuted: true,
          hasError: false,
        },
      });
      expect(buildProductListing).toHaveBeenCalledWith(mockedEngine);
    });

    it('should call buildSearch when interfaceElement.type is "search"', async () => {
      await renderQuerySummary({
        interfaceElementType: 'search',
        querySummaryState: {
          hasProducts: true,
          firstRequestExecuted: true,
          hasError: false,
        },
      });
      expect(buildSearch).toHaveBeenCalledWith(mockedEngine);
    });

    it('should bind to the query summary controller', async () => {
      const {element} = await renderQuerySummary({
        querySummaryState: {
          hasProducts: true,
          firstRequestExecuted: true,
          hasError: false,
        },
      });
      expect(element.listingOrSearchSummary).toBe(mockedQuerySummary);
    });

    it('should render the query summary container', async () => {
      const {container} = await renderQuerySummary({
        querySummaryState: {
          hasProducts: true,
          firstRequestExecuted: true,
          hasError: false,
        },
      });

      expect(container).toBeInTheDocument();
    });

    it('should render the text correctly when there is a single product', async () => {
      const {container} = await renderQuerySummary({
        querySummaryState: {
          firstProduct: 1,
          lastProduct: 1,
          totalNumberOfProducts: 1,
          hasProducts: true,
          firstRequestExecuted: true,
        },
      });

      expect(container).toHaveTextContent('Product 1 of 1');
    });

    it('should render the text correctly when there are multiple products', async () => {
      const {container} = await renderQuerySummary({
        querySummaryState: {
          firstProduct: 1,
          lastProduct: 10,
          totalNumberOfProducts: 100,
          hasProducts: true,
          firstRequestExecuted: true,
        },
      });

      expect(container).toHaveTextContent('Products 1-10 of 100');
    });

    it('should render the text correctly when there are products and a query', async () => {
      const {container} = await renderQuerySummary({
        querySummaryState: {
          firstProduct: 1,
          lastProduct: 10,
          totalNumberOfProducts: 100,
          query: 'test query',
          hasProducts: true,
          firstRequestExecuted: true,
        },
      });

      expect(container).toHaveTextContent(
        'Products 1-10 of 100 for test query'
      );
    });

    it('should highlight the first, last, total, and query in the text', async () => {
      const {container} = await renderQuerySummary({
        querySummaryState: {
          firstProduct: 1,
          lastProduct: 10,
          totalNumberOfProducts: 100,
          query: 'test query',
          hasProducts: true,
          firstRequestExecuted: true,
        },
      });

      const highlightedElements = container!.querySelectorAll(
        '[part*="highlight"]'
      );
      expect(highlightedElements.length).toBe(4);
    });

    it('should handle loading state properly', async () => {
      const messageSetterSpy = vi.spyOn(
        AriaLiveRegionController.prototype,
        'message',
        'set'
      );

      const {element} = await renderQuerySummary({
        querySummaryState: {
          isLoading: true,
          hasProducts: true,
          firstRequestExecuted: true,
        },
      });

      expect(element).toBeDefined();
      expect(messageSetterSpy).toHaveBeenCalledOnce();

      const [[calledMessage]] = messageSetterSpy.mock.calls;
      expect(calledMessage).toMatch(/loading/i);
    });

    it('should render container part', async () => {
      const {element, parts} = await renderQuerySummary({
        querySummaryState: {
          firstProduct: 1,
          lastProduct: 10,
          totalNumberOfProducts: 100,
          query: 'test query',
          hasProducts: true,
          firstRequestExecuted: true,
        },
      });

      const partsElements = parts(element);
      await expect.element(partsElements.container!).toBeInTheDocument();
    });

    it('should render highlight part', async () => {
      const {element, parts} = await renderQuerySummary({
        querySummaryState: {
          firstProduct: 1,
          lastProduct: 10,
          totalNumberOfProducts: 100,
          query: 'test query',
          hasProducts: true,
          firstRequestExecuted: true,
        },
      });

      const partsElements = parts(element);
      await expect.element(partsElements.highlight!).toBeInTheDocument();
    });

    it('should render query part', async () => {
      const {element, parts} = await renderQuerySummary({
        querySummaryState: {
          firstProduct: 1,
          lastProduct: 10,
          totalNumberOfProducts: 100,
          query: 'test query',
          hasProducts: true,
          firstRequestExecuted: true,
        },
      });

      const partsElements = parts(element);
      await expect.element(partsElements.query!).toBeInTheDocument();
    });

    it('should handle zero products gracefully', async () => {
      const {element} = await renderQuerySummary({
        querySummaryState: {
          firstProduct: 0,
          lastProduct: 0,
          totalNumberOfProducts: 0,
          hasProducts: false,
          firstRequestExecuted: true,
        },
      });

      expect(element).toBeEmptyDOMElement();
    });

    describe('when testing exact text format patterns', () => {
      it('should match exact format for multiple products with query', async () => {
        const {container} = await renderQuerySummary({
          querySummaryState: {
            firstProduct: 1,
            lastProduct: 10,
            totalNumberOfProducts: 1234,
            query: 'test',
            hasProducts: true,
            firstRequestExecuted: true,
          },
        });

        const textContent = (container?.textContent || '').trim();
        const pattern = /^Products 1-10 of [\d,]+ for test/;
        expect(textContent).toMatch(pattern);
      });

      it('should match exact format for single product with query', async () => {
        const {container} = await renderQuerySummary({
          querySummaryState: {
            firstProduct: 1,
            lastProduct: 1,
            totalNumberOfProducts: 1,
            query: "Queen's Gambit sparks world of online chess celebrities",
            hasProducts: true,
            firstRequestExecuted: true,
          },
        });

        const textContent = (container?.textContent || '').trim();
        const pattern =
          /^Product 1 of [\d,]+ for Queen's Gambit sparks world of online chess celebrities/;
        expect(textContent).toMatch(pattern);
      });
    });

    it('should not show a placeholder', async () => {
      const {placeholder} = await renderQuerySummary({
        querySummaryState: {
          firstRequestExecuted: true,
          hasProducts: true,
          hasError: false,
        },
      });

      expect(placeholder).toBeFalsy();
    });
  });
});
