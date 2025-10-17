import {
  buildProductListing,
  buildSearch,
  type ProductListingSummaryState,
  type SearchSummaryState,
  type Summary,
} from '@coveo/headless/commerce';
import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import {buildFakeCommerceEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/engine';
import {buildFakeProductListing} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product-listing-controller';
import {buildFakeSearch} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/search-controller';
import {buildFakeSummary} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/summary-subcontroller';
import MagnifyingGlassIcon from '../../../images/magnifying-glass.svg';
import type {AtomicCommerceNoProducts} from './atomic-commerce-no-products';
import './atomic-commerce-no-products';

vi.mock('@coveo/headless/commerce', {spy: true});

describe('atomic-commerce-no-products', () => {
  const mockedEngine = buildFakeCommerceEngine();
  let mockedSummary: Summary<SearchSummaryState | ProductListingSummaryState>;

  const renderNoProducts = async (options = {}) => {
    const {
      interfaceType = 'product-listing',
      summaryState = {},
    }: {
      interfaceType?: 'product-listing' | 'search';
      summaryState?: Partial<SearchSummaryState | ProductListingSummaryState>;
    } = options;

    mockedSummary = buildFakeSummary({
      state: {
        ...summaryState,
        hasProducts: false,
        firstRequestExecuted: true,
        isLoading: false,
      },
    });

    vi.mocked(buildProductListing).mockReturnValue(
      buildFakeProductListing({
        implementation: {
          summary: () => mockedSummary,
        },
      })
    );

    vi.mocked(buildSearch).mockReturnValue(
      buildFakeSearch({
        implementation: {
          summary: () => mockedSummary as Summary<SearchSummaryState>,
        },
      })
    );

    const {element} =
      await renderInAtomicCommerceInterface<AtomicCommerceNoProducts>({
        template: html`<atomic-commerce-no-products></atomic-commerce-no-products>`,
        selector: 'atomic-commerce-no-products',
        bindings: (bindings) => {
          bindings.interfaceElement.type = interfaceType;
          bindings.engine = mockedEngine;
          return bindings;
        },
      });

    return {
      element,
      slot: element.shadowRoot?.querySelector('slot'),
      icon: element.shadowRoot?.querySelector('[part="icon"]'),
      noProductsText: element.shadowRoot?.querySelector('[part="no-results"]'),
      highlightedQuery: element.shadowRoot?.querySelector('[part="highlight"]'),
      searchTips: element.shadowRoot?.querySelector('[part="search-tips"]'),
    };
  };

  it('should call buildProductListing when interfaceElement.type is "product-listing"', async () => {
    await renderNoProducts({interfaceType: 'product-listing'});
    expect(buildProductListing).toHaveBeenCalledWith(mockedEngine);
  });

  it('should call buildSearch when interfaceElement.type is "search"', async () => {
    await renderNoProducts({interfaceType: 'search'});
    expect(buildSearch).toHaveBeenCalledWith(mockedEngine);
  });

  it('should set summary to the summary sub-controller', async () => {
    const {element} = await renderNoProducts();
    expect(element.summary).toBe(mockedSummary);
  });

  it('should render nothing when firstSearchExecuted is false', async () => {
    const {element} = await renderNoProducts({
      summaryState: {
        firstRequestExecuted: false,
        isLoading: false,
        hasProducts: false,
      },
    });
    expect(element).toBeEmptyDOMElement();
  });

  it('should render nothing when isLoading is true', async () => {
    const {element} = await renderNoProducts({
      summaryState: {
        firstRequestExecuted: true,
        isLoading: true,
        hasProducts: false,
      },
    });
    expect(element).toBeEmptyDOMElement();
  });

  it('should render nothing when hasProducts is true', async () => {
    const {element} = await renderNoProducts({
      summaryState: {
        firstRequestExecuted: true,
        isLoading: false,
        hasProducts: true,
      },
    });
    expect(element).toBeEmptyDOMElement();
  });

  it('should render a slot', async () => {
    const {slot} = await renderNoProducts({
      summaryState: {
        firstRequestExecuted: true,
        isLoading: false,
        hasProducts: false,
      },
    });
    expect(slot).toBeInTheDocument();
  });

  it('should render the correct part attribute on the icon', async () => {
    const {icon} = await renderNoProducts();
    expect(icon).toHaveAttribute('part', 'icon');
  });

  it('should render an icon', async () => {
    const {icon} = await renderNoProducts();
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('icon', MagnifyingGlassIcon);
  });

  it('should render the correct part attribute on the "no products" text', async () => {
    const {noProductsText} = await renderNoProducts();

    expect(noProductsText).toHaveAttribute('part', 'no-results');
  });

  it('should render the correct text when there is a query', async () => {
    const query = 'test query';
    const {noProductsText} = await renderNoProducts({
      summaryState: {
        query,
      },
    });

    expect(noProductsText).toHaveTextContent(
      `We couldn't find any product for “${query}”`
    );
  });

  it('should highlight the query in the "no products" text', async () => {
    const query = 'test query';
    const {highlightedQuery} = await renderNoProducts({
      summaryState: {
        query,
      },
    });

    expect(highlightedQuery).toHaveTextContent(query);
  });

  it('should render the correct part attribute for the highlighted query', async () => {
    const query = 'test query';
    const {highlightedQuery} = await renderNoProducts({
      summaryState: {
        query,
      },
    });

    expect(highlightedQuery).toHaveAttribute('part', 'highlight');
  });

  it('should render the correct text when there is no query', async () => {
    const {noProductsText} = await renderNoProducts();

    expect(noProductsText).toHaveTextContent('No products');
  });

  it('should render the correct part attribute for the search tips', async () => {
    const {searchTips} = await renderNoProducts();

    expect(searchTips).toHaveAttribute('part', 'search-tips');
  });

  it('should render the correct text in the search tips', async () => {
    const {searchTips} = await renderNoProducts();

    expect(searchTips).toHaveTextContent(
      'You may want to try using different keywords, deselecting filters, or checking for spelling mistakes.'
    );
  });
});
