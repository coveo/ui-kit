import {ChildProduct} from '../../../api/commerce/common/product';
import {configuration} from '../../../app/common-reducers';
import {contextReducer as commerceContext} from '../../../features/commerce/context/context-slice';
import {manualNumericFacetReducer as manualNumericFacetSet} from '../../../features/commerce/facets/numeric-facet/manual-numeric-facet-slice';
import {
  pagePrincipalSelector,
  perPagePrincipalSelector,
  totalEntriesPrincipalSelector,
} from '../../../features/commerce/pagination/pagination-selectors';
import {searchSerializer} from '../../../features/commerce/parameters/parameters-serializer';
import {queryReducer as commerceQuery} from '../../../features/commerce/query/query-slice';
import {restoreSearchParameters} from '../../../features/commerce/search-parameters/search-parameters-actions';
import {searchParametersDefinition} from '../../../features/commerce/search-parameters/search-parameters-schema';
import * as SearchActions from '../../../features/commerce/search/search-actions';
import {
  activeParametersSelector,
  enrichedParametersSelector,
  enrichedSummarySelector,
  errorSelector,
  isLoadingSelector,
  numberOfProductsSelector,
  requestIdSelector,
  responseIdSelector,
} from '../../../features/commerce/search/search-selectors';
import {commerceSearchReducer as commerceSearch} from '../../../features/commerce/search/search-slice';
import {buildMockCommerceState} from '../../../test/mock-commerce-state';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../test/mock-engine-v2';
import * as SubControllers from '../core/sub-controller/headless-sub-controller';
import {
  facetResponseSelector,
  isFacetLoadingResponseSelector,
} from './facets/headless-search-facet-options';
import {buildSearch, Search} from './headless-search';

describe('headless search', () => {
  let search: Search;
  let engine: MockedCommerceEngine;

  beforeEach(() => {
    engine = buildMockCommerceEngine(buildMockCommerceState());
    search = buildSearch(engine);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      commerceContext,
      configuration,
      commerceSearch,
      commerceQuery,
      manualNumericFacetSet,
    });
  });

  it('uses sub-controllers', () => {
    const buildSearchSubControllers = jest.spyOn(
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
      enrichParameters: enrichedParametersSelector,
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
    const promoteChildToParent = jest.spyOn(
      SearchActions,
      'promoteChildToParent'
    );
    const child = {permanentid: 'childPermanentId'} as ChildProduct;

    search.promoteChildToParent(child);

    expect(promoteChildToParent).toHaveBeenCalledWith({child});
  });

  it('executeFirstSearch dispatches #executeSearch', () => {
    const executeSearch = jest.spyOn(SearchActions, 'executeSearch');

    search.executeFirstSearch();

    expect(executeSearch).toHaveBeenCalled();
  });
});
