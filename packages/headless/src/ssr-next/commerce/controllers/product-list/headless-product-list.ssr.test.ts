import {beforeEach, describe, expect, it, vi} from 'vitest';
import {
  buildProductListing,
  type ProductListing,
} from '../../../../controllers/commerce/product-listing/headless-product-listing.js';
import {buildSearch, type Search} from '../../../../controllers/commerce/search/headless-search.js';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state.js';
import {buildMockSSRCommerceEngine} from '../../../../test/mock-engine-v2.js';
import {buildMockCommerceBuildContext} from '../../../../test/mock-ssr-build-context.js';
import type {SSRCommerceEngine} from '../../factories/build-factory.js';
import {SolutionType} from '../../types/controller-constants.js';
import {defineProductList, type ProductListDefinition} from './headless-product-list.ssr.js';

vi.mock('../../../../controllers/commerce/product-listing/headless-product-listing.js');
vi.mock('../../../../controllers/commerce/search/headless-search.js');

describe('define product list', () => {
  let definition: ProductListDefinition;
  let engine: SSRCommerceEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(buildProductListing).mockReturnValue({} as ProductListing);
    vi.mocked(buildSearch).mockReturnValue({} as Search);
    definition = defineProductList();
    engine = buildMockSSRCommerceEngine(buildMockCommerceState());
  });

  it('should return a definition available on listing and search pages', () => {
    expect(definition).toMatchObject<ProductListDefinition>({
      build: expect.any(Function),
      listing: true,
      search: true,
    });
  });

  it('should build the listing controller with the listing results flag of the definition', () => {
    definition.build(
      engine,
      buildMockCommerceBuildContext({
        solutionType: SolutionType.listing,
        enableResults: {listing: true, search: false},
      })
    );

    expect(buildProductListing).toHaveBeenCalledWith(engine, {enableResults: true});
    expect(buildSearch).not.toHaveBeenCalled();
  });

  it('should build the search controller with the search results flag of the definition', () => {
    definition.build(
      engine,
      buildMockCommerceBuildContext({
        solutionType: SolutionType.search,
        enableResults: {listing: true, search: false},
      })
    );

    expect(buildSearch).toHaveBeenCalledWith(engine, {enableResults: false});
    expect(buildProductListing).not.toHaveBeenCalled();
  });
});
