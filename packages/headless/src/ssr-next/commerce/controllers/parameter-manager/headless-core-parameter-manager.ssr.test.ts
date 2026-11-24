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
import type {SearchBuildConfig} from '../../types/build.js';
import {SolutionType} from '../../types/controller-constants.js';
import {
  defineParameterManager,
  type ParameterManagerDefinition,
} from './headless-core-parameter-manager.ssr.js';

vi.mock('../../../../controllers/commerce/product-listing/headless-product-listing.js');
vi.mock('../../../../controllers/commerce/search/headless-search.js');

describe('define commerce parameter manager', () => {
  const listingParameterManager = vi.fn();
  const searchParameterManager = vi.fn();
  let definition: ParameterManagerDefinition;
  let engine: SSRCommerceEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(buildProductListing).mockReturnValue({
      parameterManager: listingParameterManager,
    } as unknown as ProductListing);
    vi.mocked(buildSearch).mockReturnValue({
      parameterManager: searchParameterManager,
    } as unknown as Search);
    definition = defineParameterManager();
    engine = buildMockSSRCommerceEngine(buildMockCommerceState());
  });

  it('should return a definition available on listing and search pages', () => {
    expect(definition).toMatchObject<ParameterManagerDefinition>({
      build: expect.any(Function),
      listing: true,
      search: true,
    });
    expect(definition).not.toHaveProperty('standalone');
  });

  it('should build the listing parameter manager with the search params of a listing request and the listing results flag', () => {
    definition.build(
      engine,
      buildMockCommerceBuildContext({
        solutionType: SolutionType.listing,
        enableResults: {listing: true, search: false},
        buildConfig: {searchParams: {page: 2, perPage: 24}},
      })
    );

    expect(buildProductListing).toHaveBeenCalledWith(engine, {enableResults: true});
    expect(listingParameterManager).toHaveBeenCalledWith({
      initialState: {parameters: {page: 2, perPage: 24}},
      excludeDefaultParameters: true,
    });
    expect(buildSearch).not.toHaveBeenCalled();
  });

  it('should build the search parameter manager with the query and search params of a search request and the search results flag', () => {
    const searchParams: SearchBuildConfig['searchParams'] = {q: 'shoes', page: 1};

    definition.build(
      engine,
      buildMockCommerceBuildContext({
        solutionType: SolutionType.search,
        enableResults: {listing: false, search: true},
        buildConfig: {searchParams},
      })
    );

    expect(buildSearch).toHaveBeenCalledWith(engine, {enableResults: true});
    expect(searchParameterManager).toHaveBeenCalledWith({
      initialState: {parameters: {q: 'shoes', page: 1}},
      excludeDefaultParameters: true,
    });
    expect(buildProductListing).not.toHaveBeenCalled();
  });

  it('should build the parameter manager with no parameters when the request carries none', () => {
    definition.build(engine, buildMockCommerceBuildContext({solutionType: SolutionType.search}));

    expect(searchParameterManager).toHaveBeenCalledWith({
      initialState: {parameters: {}},
      excludeDefaultParameters: true,
    });
  });
});
