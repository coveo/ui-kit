import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import {buildFakeCommerceEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/engine';
import {buildFakeProductListing} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product-listing-controller';
import {buildFakeSearch} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/search-controller';
import {buildFakeSummary} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/summary-subcontroller';
import {
  buildProductListing,
  buildSearch,
  ProductListingSummaryState,
  SearchSummaryState,
  Summary,
} from '@coveo/headless/commerce';
import {html} from 'lit';
import {describe, vi, it, expect} from 'vitest';
import './atomic-commerce-query-summary';
import {AtomicCommerceQuerySummary} from './atomic-commerce-query-summary';

vi.mock('@coveo/headless/commerce', {spy: true});

describe('AtomicCommerceQuerySummary', () => {
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

  it('should render nothing when hasResults is false and firstSearchExecuted is true', async () => {
    const {element} = await renderQuerySummary({
      querySummaryState: {
        hasProducts: false,
        firstRequestExecuted: true,
      },
    });
    expect(element).toBeEmptyDOMElement();
  });

  it('should render a placeholder when firstSearchExecuted is false', async () => {
    const {placeholder} = await renderQuerySummary({
      querySummaryState: {
        firstRequestExecuted: false,
      },
    });

    expect(placeholder).toBeTruthy();
    expect(placeholder).toBeInTheDocument();
  });

  it('should render the query summary container', async () => {
    const {container} = await renderQuerySummary();

    expect(container).toBeTruthy();
    expect(container).toBeInTheDocument();
  });

  it('should render the text correctly when there is a singular product', async () => {
    const {container} = await renderQuerySummary({
      querySummaryState: {
        firstProduct: 1,
        lastProduct: 1,
        totalNumberOfProducts: 1,
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
      },
    });

    expect(container).toHaveTextContent('Products 1-10 of 100 for test query');
  });

  it('should highlight the first, last, total, and query in the text', async () => {
    const {container} = await renderQuerySummary({
      querySummaryState: {
        firstProduct: 1,
        lastProduct: 10,
        totalNumberOfProducts: 100,
        query: 'test query',
      },
    });

    expect(container).toHaveTextContent('Products ');
    expect(container).toHaveTextContent('1');
    expect(container).toHaveTextContent('10');
    expect(container).toHaveTextContent('100');
    expect(container).toHaveTextContent('test query');

    const highlightedElements = container!.querySelectorAll('.font-bold');
    expect(highlightedElements.length).toBe(4);
  });

  it('should render every part', async () => {
    const {element, parts} = await renderQuerySummary({
      querySummaryState: {
        firstProduct: 1,
        lastProduct: 10,
        totalNumberOfProducts: 100,
        query: 'test query',
      },
    });

    const partsElements = parts(element);

    await expect.element(partsElements.container!).toBeInTheDocument();
    await expect.element(partsElements.highlight!).toBeInTheDocument();
    await expect.element(partsElements.query!).toBeInTheDocument();
  });
});
