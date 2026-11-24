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
import {
  definePagination,
  type PaginationDefinition,
} from './headless-core-commerce-pagination.ssr.js';

vi.mock('../../../../controllers/commerce/product-listing/headless-product-listing.js');
vi.mock('../../../../controllers/commerce/search/headless-search.js');

describe('define pagination', () => {
  const listingPagination = vi.fn();
  const searchPagination = vi.fn();
  let definition: PaginationDefinition;
  let engine: SSRCommerceEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(buildProductListing).mockReturnValue({
      pagination: listingPagination,
    } as unknown as ProductListing);
    vi.mocked(buildSearch).mockReturnValue({pagination: searchPagination} as unknown as Search);
    definition = definePagination({options: {pageSize: 9}});
    engine = buildMockSSRCommerceEngine(buildMockCommerceState());
  });

  it('should return a definition available on listing and search pages', () => {
    expect(definition).toMatchObject<PaginationDefinition>({
      build: expect.any(Function),
      listing: true,
      search: true,
    });
  });

  it('should build the listing pagination from a listing controller carrying the results flag', () => {
    definition.build(
      engine,
      buildMockCommerceBuildContext({
        solutionType: SolutionType.listing,
        enableResults: {listing: true, search: false},
      })
    );

    expect(buildProductListing).toHaveBeenCalledWith(engine, {enableResults: true});
    expect(listingPagination).toHaveBeenCalledWith({options: {pageSize: 9}});
    expect(buildSearch).not.toHaveBeenCalled();
  });

  it('should build the search pagination from a search controller carrying the results flag', () => {
    definition.build(
      engine,
      buildMockCommerceBuildContext({
        solutionType: SolutionType.search,
        enableResults: {listing: false, search: true},
      })
    );

    expect(buildSearch).toHaveBeenCalledWith(engine, {enableResults: true});
    expect(searchPagination).toHaveBeenCalledWith({options: {pageSize: 9}});
    expect(buildProductListing).not.toHaveBeenCalled();
  });
});
