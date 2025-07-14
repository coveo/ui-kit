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

    expect(buildSearchSubControllers).toHaveBeenCalledWith(engine, {
      responseIdSelector,
      fetchProductsActionCreator: SearchActions.executeSearch,
      fetchMoreProductsActionCreator: SearchActions.fetchMoreProducts,
      facetResponseSelector,
      isFacetLoadingResponseSelector,
      requestIdSelector,
      serializer: searchSerializer,
      parametersDefinition: searchParametersDefinition,
      restoreActionCreator: restoreSearchParameters,
      activeParametersSelector,
      isLoadingSelector,
      errorSelector,
      pageSelector: pagePrincipalSelector,
      perPageSelector: perPagePrincipalSelector,
      totalEntriesSelector: totalEntriesPrincipalSelector,
      numberOfProductsSelector,
      enrichSummary: enrichedSummarySelector,
    });
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

  it('executeFirstSearch dispatches #executeSearch', () => {
    const executeSearch = vi.spyOn(SearchActions, 'executeSearch');

    search.executeFirstSearch();

    expect(executeSearch).toHaveBeenCalled();
  });
});
