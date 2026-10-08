import type {MockInstance} from 'vitest';
import {CommerceAPIClient} from '../../../../api/commerce/commerce-api-client.js';
import type {CommerceListingRequest} from '../../../../api/commerce/listing/request.js';
import type {CommerceSearchRequest} from '../../../../api/commerce/search/request.js';
import type {SearchCommerceSuccessResponse} from '../../../../api/commerce/search/response.js';
import type {BaseResult} from '../../../../api/commerce/common/result.js';
import {ResultType} from '../../../../api/commerce/common/result.js';
import {
  buildCommerceEngine,
  type CommerceEngine,
} from '../../../../app/commerce-engine/commerce-engine.js';
import {stateKey} from '../../../../app/state-key.js';
import {getSampleCommerceEngineConfiguration} from '../../../../app/commerce-engine/commerce-engine-configuration.js';
import {buildMockBaseProduct} from '../../../../test/mock-product.js';
import {buildMockBaseSpotlightContent} from '../../../../test/mock-spotlight-content.js';
import {buildProductListing} from '../../product-listing/headless-product-listing.js';
import {buildSearch} from '../../search/headless-search.js';

const PER_PAGE = 5;
const TOTAL_PRODUCTS = 18;
const SPOTLIGHT_INDEXES = new Set([2, 9, 13]);

/**
 * Mimics the Commerce API contract: `perPage` and `totalEntries` count products and spotlight
 * content together, so a spotlight pushes the next product onto the following page.
 */
function buildCatalog(): BaseResult[] {
  const catalog: BaseResult[] = [];
  let productCount = 0;
  let spotlightCount = 0;
  while (productCount < TOTAL_PRODUCTS) {
    if (SPOTLIGHT_INDEXES.has(catalog.length)) {
      catalog.push(buildMockBaseSpotlightContent({id: `spotlight-${spotlightCount++}`}));
    } else {
      catalog.push(
        buildMockBaseProduct({
          permanentid: `product-${productCount}`,
          ec_name: `product-${productCount++}`,
        })
      );
    }
  }
  return catalog;
}

function buildPage(
  catalog: BaseResult[],
  {page = 0, perPage = PER_PAGE}: {page?: number; perPage?: number}
): SearchCommerceSuccessResponse {
  const results = catalog.slice(page * perPage, (page + 1) * perPage);
  const totalSpotlightContent = catalog.filter(
    (result) => result.resultType === ResultType.SPOTLIGHT
  ).length;
  return {
    responseId: `response-${page}`,
    facets: [],
    sort: {appliedSort: {sortCriteria: 'relevance'}, availableSorts: []},
    triggers: [],
    products: results.filter((result) => result.resultType !== ResultType.SPOTLIGHT),
    results,
    pagination: {
      page,
      perPage,
      totalEntries: catalog.length,
      totalPages: Math.ceil(catalog.length / perPage),
      totalProducts: catalog.length - totalSpotlightContent,
      totalSpotlightContent,
    },
  } as SearchCommerceSuccessResponse;
}

const productNames = (results: {resultType: ResultType; ec_name?: string | null}[]) =>
  results
    .filter((result) => result.resultType !== ResultType.SPOTLIGHT)
    .map((result) => result.ec_name);

const allProductNames = Array.from({length: TOTAL_PRODUCTS}, (_, i) => `product-${i}`);

describe('load more with spotlight content', () => {
  let engine: CommerceEngine;
  let catalog: BaseResult[];

  beforeEach(() => {
    catalog = buildCatalog();
    const configuration = getSampleCommerceEngineConfiguration();
    engine = buildCommerceEngine({
      configuration: {
        ...configuration,
        analytics: {...configuration.analytics, enabled: false},
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe.each([
    {
      name: 'search',
      method: 'search' as const,
      build: () => {
        const controller = buildSearch(engine, {enableResults: true});
        return {
          controller,
          state: () => engine[stateKey].commerceSearch,
          executeFirstRequest: () => controller.executeFirstSearch(),
        };
      },
    },
    {
      name: 'product listing',
      method: 'getProductListing' as const,
      build: () => {
        const controller = buildProductListing(engine, {enableResults: true});
        return {
          controller,
          state: () => engine[stateKey].productListing,
          executeFirstRequest: () => controller.executeFirstRequest(),
        };
      },
    },
  ])('$name', ({method, build}) => {
    let apiSpy: MockInstance<
      (req: CommerceSearchRequest | CommerceListingRequest) => Promise<unknown>
    >;
    let sut: ReturnType<typeof build>;

    async function waitForResultCount(count: number) {
      await vi.waitFor(() => {
        expect(sut.state().isLoading).toBe(false);
        expect(sut.state().results).toHaveLength(count);
      });
    }

    beforeEach(() => {
      apiSpy = vi.spyOn(
        CommerceAPIClient.prototype as unknown as Record<
          typeof method,
          Parameters<typeof apiSpy.mockImplementation>[0]
        >,
        method
      );
      apiSpy.mockImplementation(async (req) => ({success: buildPage(catalog, req)}));
      sut = build();
    });

    it('requests consecutive pages and loads every product exactly once across several load more calls', async () => {
      sut.executeFirstRequest();
      await waitForResultCount(PER_PAGE);

      const pagination = sut.controller.pagination();
      let expectedCount = PER_PAGE;
      while (pagination.state.totalEntries > sut.state().results.length) {
        pagination.fetchMoreProducts();
        expectedCount = Math.min(expectedCount + PER_PAGE, catalog.length);
        await waitForResultCount(expectedCount);
      }

      const requestedPages = apiSpy.mock.calls.map(([req]) => req.page ?? 0);
      expect(requestedPages).toEqual([0, 1, 2, 3, 4]);
      expect(productNames(sut.state().results)).toEqual(allProductNames);
      expect(sut.state().results.map((result) => result.position)).toEqual(
        catalog.map((_, index) => index + 1)
      );
    });

    it('does not request another page once every product and spotlight is loaded', async () => {
      sut.executeFirstRequest();
      await waitForResultCount(PER_PAGE);

      const pagination = sut.controller.pagination();
      for (let page = 1; page < Math.ceil(catalog.length / PER_PAGE); page++) {
        pagination.fetchMoreProducts();
        await waitForResultCount(Math.min((page + 1) * PER_PAGE, catalog.length));
      }
      const callCount = apiSpy.mock.calls.length;

      pagination.fetchMoreProducts();
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(apiSpy).toHaveBeenCalledTimes(callCount);
      expect(sut.state().results).toHaveLength(catalog.length);
    });

    it('excludes spotlight content from the summary product counts', async () => {
      sut.executeFirstRequest();
      await waitForResultCount(PER_PAGE);

      const summary = sut.controller.summary();
      expect(summary.state.totalNumberOfProducts).toBe(TOTAL_PRODUCTS);
      expect(summary.state.firstProduct).toBe(1);
      expect(summary.state.lastProduct).toBe(4);

      sut.controller.pagination().fetchMoreProducts();
      await waitForResultCount(PER_PAGE * 2);

      expect(summary.state.totalNumberOfProducts).toBe(TOTAL_PRODUCTS);
      expect(summary.state.lastProduct).toBe(8);
    });
  });
});
