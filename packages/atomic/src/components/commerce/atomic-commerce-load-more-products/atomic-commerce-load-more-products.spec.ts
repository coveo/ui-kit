import {
  buildProductListing,
  buildSearch,
  type Pagination,
} from '@coveo/headless/commerce';
import {html} from 'lit';
import {beforeEach, describe, expect, it, type Mock, vi} from 'vitest';
import {page} from 'vitest/browser';
import type {ResultListInfo} from '@/src/components/common/interface/store';
import {createAppLoadedListener} from '@/src/components/common/interface/store';
import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import {buildFakeCommerceEngine} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/engine';
import {buildFakePager} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/pager-subcontroller';
import {buildFakeProduct} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product';
import {buildFakeProductListing} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product-listing-controller';
import {buildFakeSearch} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/search-controller';
import type {AtomicCommerceLoadMoreProducts} from './atomic-commerce-load-more-products';
import './atomic-commerce-load-more-products';

vi.mock('@coveo/headless/commerce', {spy: true});
vi.mock('@/src/components/common/interface/store', {spy: true});

describe('atomic-commerce-load-more-products', () => {
  const mockedEngine = buildFakeCommerceEngine();
  let appLoadedCallback: (isAppLoaded: boolean) => void;

  beforeEach(() => {
    vi.mocked(createAppLoadedListener).mockImplementation((_store, cb) => {
      appLoadedCallback = cb;
    });
  });

  const renderLoadMoreProducts = async ({
    interfaceType = 'product-listing',
    isAppLoaded = true,
    numberOfProducts = 10,
    totalNumberOfProducts = 100,
  }: {
    interfaceType?: 'product-listing' | 'search';
    isAppLoaded?: boolean;
    numberOfProducts?: number;
    totalNumberOfProducts?: number;
  } = {}) => {
    const focusOnNextNewResultSpy = vi.fn();
    const fetchMoreProductsSpy = vi.fn();

    const fakeProducts = Array.from({length: numberOfProducts}, (_, i) =>
      buildFakeProduct({permanentid: `product-${i}`})
    );

    const paginationSpy = vi.fn(() =>
      buildFakePager({
        state: {
          totalEntries: totalNumberOfProducts,
          ...{testId: `${interfaceType}-pagination`},
        },
        implementation: {
          fetchMoreProducts: fetchMoreProductsSpy,
        },
      })
    );

    if (interfaceType === 'product-listing') {
      vi.mocked(buildProductListing).mockReturnValue(
        buildFakeProductListing({
          state: {
            responseId: 'product-listing-response-id',
            products: fakeProducts,
          },
          implementation: {
            pagination: paginationSpy,
          },
        })
      );
    } else {
      vi.mocked(buildSearch).mockReturnValue(
        buildFakeSearch({
          state: {
            responseId: 'search-response-id',
            products: fakeProducts,
          },
          implementation: {
            pagination: paginationSpy,
          },
        })
      );
    }

    const {element} =
      await renderInAtomicCommerceInterface<AtomicCommerceLoadMoreProducts>({
        template: html`<atomic-commerce-load-more-products></atomic-commerce-load-more-products>`,
        selector: 'atomic-commerce-load-more-products',
        bindings: (bindings) => {
          bindings.interfaceElement.type = interfaceType;
          bindings.engine = mockedEngine;
          bindings.store.state.resultList = {
            focusOnNextNewResult: focusOnNextNewResultSpy,
          } as unknown as ResultListInfo;
          bindings.store.state.loadingFlags = isAppLoaded
            ? []
            : ['app-loading'];
          return bindings;
        },
      });

    appLoadedCallback(isAppLoaded);

    return {
      element,
      fetchMoreProductsSpy,
      focusOnNextNewResultSpy,
      paginationSpy,
      locators: {
        get loadMoreButton() {
          return page.getByRole('button');
        },
        get showingResults() {
          return element.shadowRoot?.querySelector('[part="showing-results"]');
        },
        get progressBar() {
          return element.shadowRoot?.querySelector('[part="progress-bar"]');
        },
        get container() {
          return element.shadowRoot?.querySelector('[part="container"]');
        },
      },
    };
  };

  describe('#initialize', () => {
    it('should call #createAppLoadedListener with store', async () => {
      const {element} = await renderLoadMoreProducts();
      expect(createAppLoadedListener).toHaveBeenCalledWith(
        element.bindings.store,
        expect.any(Function)
      );
    });

    it('should update #isAppLoaded when app loaded state changes', async () => {
      const {element} = await renderLoadMoreProducts({
        isAppLoaded: false,
      });
      // biome-ignore lint/complexity/useLiteralKeys: <accessing private property for testing>
      expect(element['isAppLoaded']).toBe(false);

      appLoadedCallback(true);
      // biome-ignore lint/complexity/useLiteralKeys: <accessing private property for testing>
      expect(element['isAppLoaded']).toBe(true);
    });
  });

  describe("when interface element type is 'product-listing'", () => {
    let element: AtomicCommerceLoadMoreProducts;
    let paginationSpy: Mock<() => Pagination>;

    beforeEach(async () => {
      const result = await renderLoadMoreProducts({
        interfaceType: 'product-listing',
      });
      element = result.element;
      paginationSpy = result.paginationSpy;
    });

    it('should call #buildProductListing with engine', async () => {
      expect(buildProductListing).toHaveBeenCalledExactlyOnceWith(mockedEngine);
      expect(element.listingOrSearch.state.responseId).toBe(
        'product-listing-response-id'
      );
    });

    it('should initialize pagination controller from product listing', async () => {
      expect(paginationSpy).toHaveBeenCalledOnce();
      expect(element.pagination.state).toHaveProperty(
        'testId',
        'product-listing-pagination'
      );
    });
  });

  describe("when interface element type is 'search'", () => {
    let element: AtomicCommerceLoadMoreProducts;
    let paginationSpy: Mock<() => Pagination>;

    beforeEach(async () => {
      const result = await renderLoadMoreProducts({
        interfaceType: 'search',
      });
      element = result.element;
      paginationSpy = result.paginationSpy;
    });

    it('should call #buildSearch with engine', async () => {
      expect(buildSearch).toHaveBeenCalledExactlyOnceWith(mockedEngine);
      expect(element.listingOrSearch.state.responseId).toBe(
        'search-response-id'
      );
    });

    it('should initialize pagination controller from search', async () => {
      expect(paginationSpy).toHaveBeenCalledOnce();
      expect(element.pagination.state).toHaveProperty(
        'testId',
        'search-pagination'
      );
    });
  });

  // render ====================================================================
  it('should render nothing when the app is not loaded', async () => {
    const {locators} = await renderLoadMoreProducts({
      isAppLoaded: false,
    });

    expect(locators.container).not.toBeInTheDocument();
  });

  it('should render nothing when there are no products', async () => {
    const {locators} = await renderLoadMoreProducts({
      totalNumberOfProducts: 0,
    });

    expect(locators.container).not.toBeInTheDocument();
  });

  describe('when the app is loaded and there are products', () => {
    it('should render the container', async () => {
      const {locators} = await renderLoadMoreProducts();

      expect(locators.container).toBeInTheDocument();
    });

    it('should render a localized summary with formatted numbers', async () => {
      const {locators} = await renderLoadMoreProducts({
        numberOfProducts: 1234,
        totalNumberOfProducts: 1234567,
      });
      const summaryElement = locators.showingResults;

      expect(summaryElement).toBeInTheDocument();
      expect(summaryElement?.textContent?.trim()).toBe(
        'Showing 1,234 of 1,234,567 products'
      );
    });

    it('should render a progress bar with the correct width', async () => {
      const {locators} = await renderLoadMoreProducts({
        numberOfProducts: 12,
        totalNumberOfProducts: 123,
      });
      const progressBar = locators.progressBar;
      const progressBarFill = progressBar?.querySelector(
        '[part="progress-bar"] div'
      );

      expect(progressBar).toBeInTheDocument();
      // Math.ceil(Math.min((12 / 123) * 100, 100)) = 10, so width will be 10%
      expect(progressBarFill).toHaveStyle('width: 10%');
    });

    it('should not render a load more button when all products are loaded', async () => {
      const {locators} = await renderLoadMoreProducts({
        numberOfProducts: 10,
        totalNumberOfProducts: 10,
      });

      await expect.element(locators.loadMoreButton).not.toBeInTheDocument();
    });

    it('should render a load more button with the correct localized label when more products are available', async () => {
      const {locators} = await renderLoadMoreProducts({
        numberOfProducts: 10,
        totalNumberOfProducts: 100,
      });

      await expect.element(locators.loadMoreButton).toBeInTheDocument();
      expect(locators.loadMoreButton).toHaveTextContent('Load more products');
    });

    describe('when the load more button is clicked', () => {
      let fetchMoreProductsSpy: Mock;
      let focusOnNextNewResultSpy: Mock;

      beforeEach(async () => {
        const result = await renderLoadMoreProducts();
        fetchMoreProductsSpy = result.fetchMoreProductsSpy;
        focusOnNextNewResultSpy = result.focusOnNextNewResultSpy;

        await result.locators.loadMoreButton.click();
      });
      it('should call #fetchMoreProducts', async () => {
        expect(fetchMoreProductsSpy).toHaveBeenCalledOnce();
      });

      it('should call #focusOnNextNewResult', async () => {
        expect(focusOnNextNewResultSpy).toHaveBeenCalledOnce();
      });
    });
  });
});
