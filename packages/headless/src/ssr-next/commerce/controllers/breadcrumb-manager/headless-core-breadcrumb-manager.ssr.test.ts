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
  type BreadcrumbManagerDefinition,
  defineBreadcrumbManager,
} from './headless-core-breadcrumb-manager.ssr.js';

vi.mock('../../../../controllers/commerce/product-listing/headless-product-listing.js');
vi.mock('../../../../controllers/commerce/search/headless-search.js');

describe('define breadcrumb manager', () => {
  const listingBreadcrumbManager = vi.fn();
  const searchBreadcrumbManager = vi.fn();
  let definition: BreadcrumbManagerDefinition;
  let engine: SSRCommerceEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(buildProductListing).mockReturnValue({
      breadcrumbManager: listingBreadcrumbManager,
    } as unknown as ProductListing);
    vi.mocked(buildSearch).mockReturnValue({
      breadcrumbManager: searchBreadcrumbManager,
    } as unknown as Search);
    definition = defineBreadcrumbManager();
    engine = buildMockSSRCommerceEngine(buildMockCommerceState());
  });

  it('should build the listing breadcrumb manager from a listing controller carrying the results flag', () => {
    definition.build(
      engine,
      buildMockCommerceBuildContext({
        solutionType: SolutionType.listing,
        enableResults: {listing: true, search: false},
      })
    );

    expect(buildProductListing).toHaveBeenCalledWith(engine, {enableResults: true});
    expect(listingBreadcrumbManager).toHaveBeenCalledOnce();
    expect(buildSearch).not.toHaveBeenCalled();
  });

  it('should build the search breadcrumb manager from a search controller carrying the results flag', () => {
    definition.build(
      engine,
      buildMockCommerceBuildContext({
        solutionType: SolutionType.search,
        enableResults: {listing: false, search: true},
      })
    );

    expect(buildSearch).toHaveBeenCalledWith(engine, {enableResults: true});
    expect(searchBreadcrumbManager).toHaveBeenCalledOnce();
    expect(buildProductListing).not.toHaveBeenCalled();
  });
});
