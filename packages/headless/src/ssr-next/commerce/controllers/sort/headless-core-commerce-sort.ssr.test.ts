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
import {defineSort, type SortDefinition} from './headless-core-commerce-sort.ssr.js';

vi.mock('../../../../controllers/commerce/product-listing/headless-product-listing.js');
vi.mock('../../../../controllers/commerce/search/headless-search.js');

describe('define sort', () => {
  const listingSort = vi.fn();
  const searchSort = vi.fn();
  const props = {initialState: {criterion: {by: 'relevance' as const}}};
  let definition: SortDefinition;
  let engine: SSRCommerceEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(buildProductListing).mockReturnValue({
      sort: listingSort,
    } as unknown as ProductListing);
    vi.mocked(buildSearch).mockReturnValue({sort: searchSort} as unknown as Search);
    definition = defineSort(props);
    engine = buildMockSSRCommerceEngine(buildMockCommerceState());
  });

  it('should build the listing sort from a listing controller carrying the results flag', () => {
    definition.build(
      engine,
      buildMockCommerceBuildContext({
        solutionType: SolutionType.listing,
        enableResults: {listing: true, search: false},
      })
    );

    expect(buildProductListing).toHaveBeenCalledWith(engine, {enableResults: true});
    expect(listingSort).toHaveBeenCalledWith(props);
    expect(buildSearch).not.toHaveBeenCalled();
  });

  it('should build the search sort from a search controller carrying the results flag', () => {
    definition.build(
      engine,
      buildMockCommerceBuildContext({
        solutionType: SolutionType.search,
        enableResults: {listing: false, search: true},
      })
    );

    expect(buildSearch).toHaveBeenCalledWith(engine, {enableResults: true});
    expect(searchSort).toHaveBeenCalledWith(props);
    expect(buildProductListing).not.toHaveBeenCalled();
  });
});
