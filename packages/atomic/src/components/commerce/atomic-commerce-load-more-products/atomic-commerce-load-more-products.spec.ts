import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import {buildFakePager} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/pager-subcontroller';
import {buildFakeProduct} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product';
import {buildFakeProductListing} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product-listing-controller';
import {buildFakeSearch} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/search-controller';
import {
  buildProductListing,
  buildSearch,
  PaginationState,
} from '@coveo/headless/commerce';
import {page} from '@vitest/browser/context';
import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import './atomic-commerce-load-more-products';
import {AtomicCommerceLoadMoreProducts} from './atomic-commerce-load-more-products';

vi.mock('@coveo/headless/commerce', {spy: true});

describe('atomic-commerce-load-more-products', () => {
  const renderLoadMoreProducts = async ({
    interfaceType = 'product-listing',
    paginationState,
    productListingState,
    searchState,
    isAppLoaded = true,
  }: {
    interfaceType?: 'product-listing' | 'search';
    paginationState?: Partial<PaginationState>;
    productListingState?: Partial<
      Parameters<typeof buildFakeProductListing>[0]['state']
    >;
    searchState?: Partial<Parameters<typeof buildFakeSearch>[0]['state']>;
    isAppLoaded?: boolean;
  } = {}) => {
    const focusOnNextNewResultSpy = vi.fn();
    const mockPagination = buildFakePager({
      state: {
        totalEntries: 100,
        ...paginationState,
      },
    });
    const fetchMoreProductsSpy = vi.spyOn(mockPagination, 'fetchMoreProducts');

    if (interfaceType === 'product-listing') {
      vi.mocked(buildProductListing).mockReturnValue(
        buildFakeProductListing({
          state: {
            products: Array.from({length: 25}, (_, i) =>
              buildFakeProduct({permanentid: `product-${i}`})
            ),
            isLoading: false,
            ...productListingState,
          },
          implementation: {
            pagination: () => mockPagination,
          },
        })
      );
    } else {
      vi.mocked(buildSearch).mockReturnValue(
        buildFakeSearch({
          state: {
            products: Array.from({length: 25}, (_, i) =>
              buildFakeProduct({permanentid: `product-${i}`})
            ),
            isLoading: false,
            ...searchState,
          },
          implementation: {
            pagination: () => mockPagination,
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
          bindings.store.onChange = vi.fn();
          bindings.store.state.resultList = {
            focusOnNextNewResult: focusOnNextNewResultSpy,
          };
          bindings.store.state.loadingFlags = isAppLoaded
            ? []
            : ['app-loading'];
          return bindings;
        },
      });

    return {
      element,
      fetchMoreProductsSpy,
      focusOnNextNewResultSpy,
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

  describe("when interface element type is 'product-listing'", () => {
    it('should call #buildProductListing with engine', async () => {
      const {element} = await renderLoadMoreProducts({
        interfaceType: 'product-listing',
      });

      expect(buildProductListing).toHaveBeenCalledExactlyOnceWith(
        element.bindings.engine
      );
      expect(element.pagination).toBeDefined();
    });

    it('should initialize pagination controller from product listing', async () => {
      const paginationSpy = vi.fn().mockReturnValue(buildFakePager());
      const mockProductListing = buildFakeProductListing({
        implementation: {
          pagination: paginationSpy,
        },
      });
      vi.mocked(buildProductListing).mockReturnValue(mockProductListing);

      const {element} =
        await renderInAtomicCommerceInterface<AtomicCommerceLoadMoreProducts>({
          template: html`<atomic-commerce-load-more-products></atomic-commerce-load-more-products>`,
          selector: 'atomic-commerce-load-more-products',
          bindings: (bindings) => {
            bindings.interfaceElement.type = 'product-listing';
            bindings.store.onChange = vi.fn();
            return bindings;
          },
        });

      expect(paginationSpy).toHaveBeenCalledOnce();
      expect(element.listingOrSearch).toBe(mockProductListing);
    });
  });

  describe("when interface element type is 'search'", () => {
    it('should call #buildSearch with engine', async () => {
      const {element} = await renderLoadMoreProducts({
        interfaceType: 'search',
      });

      expect(buildSearch).toHaveBeenCalledExactlyOnceWith(
        element.bindings.engine
      );
      expect(element.pagination).toBeDefined();
    });

    it('should initialize pagination controller from search', async () => {
      const paginationSpy = vi.fn().mockReturnValue(buildFakePager());
      const mockSearch = buildFakeSearch({
        implementation: {
          pagination: paginationSpy,
        },
      });
      vi.mocked(buildSearch).mockReturnValue(mockSearch);

      const {element} =
        await renderInAtomicCommerceInterface<AtomicCommerceLoadMoreProducts>({
          template: html`<atomic-commerce-load-more-products></atomic-commerce-load-more-products>`,
          selector: 'atomic-commerce-load-more-products',
          bindings: (bindings) => {
            bindings.interfaceElement.type = 'search';
            bindings.store.onChange = vi.fn();
            return bindings;
          },
        });

      expect(paginationSpy).toHaveBeenCalledOnce();
      expect(element.listingOrSearch).toBe(mockSearch);
    });
  });

  // render ====================================================================
  it('should render nothing when the app is not loaded', async () => {
    const {locators} = await renderLoadMoreProducts({
      interfaceType: 'product-listing',
      isAppLoaded: false,
      paginationState: {totalEntries: 100},
    });

    expect(locators.container).not.toBeInTheDocument();
  });

  it('should render nothing when there are no products', async () => {
    const {locators} = await renderLoadMoreProducts({
      interfaceType: 'product-listing',
      isAppLoaded: true,
      paginationState: {totalEntries: 0},
    });

    expect(locators.container).not.toBeInTheDocument();
  });

  describe('when the app is loaded and there are products', () => {
    it('should render the container', async () => {
      const {locators} = await renderLoadMoreProducts({
        interfaceType: 'product-listing',
        paginationState: {totalEntries: 100},
        productListingState: {
          products: Array.from({length: 25}, (_, i) =>
            buildFakeProduct({permanentid: `product-${i}`})
          ),
        },
      });

      expect(locators.container).toBeInTheDocument();
    });

    it('should render a localized summary with formatted numbers', async () => {
      const {locators} = await renderLoadMoreProducts({
        interfaceType: 'product-listing',
        paginationState: {totalEntries: 1234567},
        productListingState: {
          products: Array.from({length: 123456}, (_, i) =>
            buildFakeProduct({permanentid: `product-${i}`})
          ),
        },
      });
      const summaryElement = locators.showingResults;

      expect(summaryElement?.textContent?.trim()).toBe(
        'Showing 123,456 of 1,234,567 products'
      );
    });

    it('should render a progress bar with the correct width', async () => {
      const {locators} = await renderLoadMoreProducts({
        interfaceType: 'product-listing',
        paginationState: {totalEntries: 1234567},
        productListingState: {
          products: Array.from({length: 123456}, (_, i) =>
            buildFakeProduct({permanentid: `product-${i}`})
          ),
        },
      });
      const progressBar = locators.progressBar;
      const progressBarFill = progressBar?.querySelector('.progress-bar');

      // Math.ceil(Math.min((123456 / 1234567) * 100, 100)) = 10, so width will be 10%
      expect(progressBarFill).toHaveStyle('width: 10%');
    });

    it('should render a load more button with the correct localized label when more products are available', async () => {
      const {locators} = await renderLoadMoreProducts({
        interfaceType: 'product-listing',
        paginationState: {totalEntries: 100},
        productListingState: {
          products: Array.from({length: 25}, (_, i) =>
            buildFakeProduct({permanentid: `product-${i}`})
          ),
        },
      });

      await expect.element(locators.loadMoreButton).toBeInTheDocument();
      expect(locators.loadMoreButton).toHaveTextContent('Load more products');
    });

    describe('when the load more button is clicked', () => {
      it('should call #fetchMoreProducts', async () => {
        const {fetchMoreProductsSpy, locators} = await renderLoadMoreProducts({
          interfaceType: 'product-listing',
          paginationState: {totalEntries: 100},
          productListingState: {
            products: Array.from({length: 25}, (_, i) =>
              buildFakeProduct({permanentid: `product-${i}`})
            ),
          },
        });

        await locators.loadMoreButton.click();

        expect(fetchMoreProductsSpy).toHaveBeenCalledOnce();
      });

      it('should call #focusOnNextNewResult', async () => {
        const {focusOnNextNewResultSpy, locators} =
          await renderLoadMoreProducts({
            interfaceType: 'product-listing',
            paginationState: {totalEntries: 100},
            productListingState: {
              products: Array.from({length: 25}, (_, i) =>
                buildFakeProduct({permanentid: `product-${i}`})
              ),
            },
          });

        await locators.loadMoreButton.click();

        expect(focusOnNextNewResultSpy).toHaveBeenCalledOnce();
      });
    });

    it('should not render a load more button when all products are loaded', async () => {
      const {locators} = await renderLoadMoreProducts({
        interfaceType: 'product-listing',
        paginationState: {totalEntries: 25},
        productListingState: {
          products: Array.from({length: 25}, (_, i) =>
            buildFakeProduct({permanentid: `product-${i}`})
          ),
        },
      });

      await expect.element(locators.loadMoreButton).not.toBeInTheDocument();
    });
  });
});
