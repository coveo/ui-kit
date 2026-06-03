import type {ChildProduct} from '../../../api/commerce/common/product.js';
import {configuration} from '../../../app/common-reducers.js';
import {contextReducer as commerceContext} from '../../../features/commerce/context/context-slice.js';
import {
  pagePrincipalSelector,
  perPagePrincipalSelector,
  totalEntriesPrincipalSelector,
} from '../../../features/commerce/pagination/pagination-selectors.js';
import {searchSerializer} from '../../../features/commerce/parameters/parameters-serializer.js';
import {queryReducer as commerceQuery} from '../../../features/commerce/query/query-slice.js';
import * as SearchActions from '../../../features/commerce/search/search-actions.js';
import {
  activeParametersSelector,
  enrichedSummarySelector,
  errorSelector,
  isLoadingSelector,
  numberOfProductsSelector,
  requestIdSelector,
  responseIdSelector,
} from '../../../features/commerce/search/search-selectors.js';
import {commerceSearchReducer as commerceSearch} from '../../../features/commerce/search/search-slice.js';
import {restoreSearchParameters} from '../../../features/commerce/search-parameters/search-parameters-actions.js';
import {searchParametersDefinition} from '../../../features/commerce/search-parameters/search-parameters-schema.js';
import {buildMockCommerceState} from '../../../test/mock-commerce-state.js';
import {
  buildMockCommerceEngine,
  type MockedCommerceEngine,
} from '../../../test/mock-engine-v2.js';
import * as SubControllers from '../core/sub-controller/headless-sub-controller.js';
import {
  facetResponseSelector,
  isFacetLoadingResponseSelector,
} from './facets/headless-search-facet-options.js';
import {buildSearch, type Search} from './headless-search.js';

describe('headless search', () => {
  let search: Search;
  let engine: MockedCommerceEngine;

  beforeEach(() => {
    engine = buildMockCommerceEngine(buildMockCommerceState());
    search = buildSearch(engine);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      commerceContext,
      configuration,
      commerceSearch,
      commerceQuery,
    });
  });

  it('uses sub-controllers', () => {
    const buildSearchSubControllers = vi.spyOn(
      SubControllers,
      'buildSearchSubControllers'
    );

    buildSearch(engine);

    const call = buildSearchSubControllers.mock.calls[0];
    expect(call[0]).toBe(engine);

    const options = call[1];
    expect(options.responseIdSelector).toBe(responseIdSelector);
    expect(options.facetResponseSelector).toBe(facetResponseSelector);
    expect(options.isFacetLoadingResponseSelector).toBe(
      isFacetLoadingResponseSelector
    );
    expect(options.requestIdSelector).toBe(requestIdSelector);
    expect(options.serializer).toBe(searchSerializer);
    expect(options.parametersDefinition).toBe(searchParametersDefinition);
    expect(options.restoreActionCreator).toBe(restoreSearchParameters);
    expect(options.activeParametersSelector).toBe(activeParametersSelector);
    expect(options.isLoadingSelector).toBe(isLoadingSelector);
    expect(options.errorSelector).toBe(errorSelector);
    expect(options.pageSelector).toBe(pagePrincipalSelector);
    expect(options.perPageSelector).toBe(perPagePrincipalSelector);
    expect(options.totalEntriesSelector).toBe(totalEntriesPrincipalSelector);
    expect(options.numberOfProductsSelector).toBe(numberOfProductsSelector);
    expect(options.enrichSummary).toBe(enrichedSummarySelector);

    // Verify action creators are functions (wrapped with enableResults)
    expect(typeof options.fetchProductsActionCreator).toBe('function');
    expect(typeof options.fetchMoreProductsActionCreator).toBe('function');
  });

  it('creates closures for fetching products that capture default enableResults=false', () => {
    const buildSearchSubControllers = vi.spyOn(
      SubControllers,
      'buildSearchSubControllers'
    );
    const executeSearchMock = vi.spyOn(SearchActions, 'executeSearch');
    const fetchMoreProductsMock = vi.spyOn(SearchActions, 'fetchMoreProducts');

    buildSearch(engine);

    const callArgs = buildSearchSubControllers.mock.calls[0][1];
    callArgs.fetchProductsActionCreator();
    expect(executeSearchMock).toHaveBeenCalledWith({
      enableResults: false,
    });

    callArgs.fetchMoreProductsActionCreator();
    expect(fetchMoreProductsMock).toHaveBeenCalledWith({enableResults: false});
  });

  it('creates closures for fetching products that capture enableResults=true', () => {
    vi.clearAllMocks();

    const buildSearchSubControllers = vi.spyOn(
      SubControllers,
      'buildSearchSubControllers'
    );
    const executeSearchMock = vi.spyOn(SearchActions, 'executeSearch');
    const fetchMoreProductsMock = vi.spyOn(SearchActions, 'fetchMoreProducts');

    buildSearch(engine, {enableResults: true});

    const callArgs = buildSearchSubControllers.mock.calls[0][1];
    callArgs.fetchProductsActionCreator();
    expect(executeSearchMock).toHaveBeenCalledWith({enableResults: true});

    callArgs.fetchMoreProductsActionCreator();
    expect(fetchMoreProductsMock).toHaveBeenCalledWith({enableResults: true});
  });

  it('#promoteChildToParent dispatches #promoteChildToParent with the correct arguments', () => {
    const promoteChildToParent = vi.spyOn(
      SearchActions,
      'promoteChildToParent'
    );
    const child = {permanentid: 'childPermanentId'} as ChildProduct;

    search.promoteChildToParent(child);

    expect(promoteChildToParent).toHaveBeenCalledWith({child});
  });

  it('#executeFirstSearch dispatches #executeSearch with enableResults=false by default', () => {
    const executeSearch = vi.spyOn(SearchActions, 'executeSearch');
    const searchController = buildSearch(engine);
    searchController.executeFirstSearch();

    expect(executeSearch).toHaveBeenCalledWith({enableResults: false});
  });

  it('#executeFirstSearch dispatches #executeSearch with enableResults=true when specified', () => {
    const executeSearch = vi.spyOn(SearchActions, 'executeSearch');
    const searchWithResults = buildSearch(engine, {
      enableResults: true,
    });

    searchWithResults.executeFirstSearch();

    expect(executeSearch).toHaveBeenCalledWith({enableResults: true});
  });
});
