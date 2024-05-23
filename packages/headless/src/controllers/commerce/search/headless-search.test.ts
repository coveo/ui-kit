import {configuration} from '../../../app/common-reducers';
import {contextReducer as commerceContext} from '../../../features/commerce/context/context-slice';
import {queryReducer as commerceQuery} from '../../../features/commerce/query/query-slice';
import {searchSerializer} from '../../../features/commerce/search-parameters/search-parameter-serializer';
import * as SearchActions from '../../../features/commerce/search/search-actions';
import {
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
import {buildSearchParameterManager} from './parameter-manager/headless-search-parameter-manager';

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
      parameterManagerBuilder: buildSearchParameterManager,
      serializer: searchSerializer,
    });
  });

  it('#promoteChildToParent dispatches #promoteChildToParent with the correct arguments', () => {
    const promoteChildToParent = jest.spyOn(
      SearchActions,
      'promoteChildToParent'
    );
    const childPermanentId = 'childPermanentId';
    const parentPermanentId = 'parentPermanentId';

    search.promoteChildToParent(childPermanentId, parentPermanentId);

    expect(promoteChildToParent).toHaveBeenCalledWith({
      childPermanentId,
      parentPermanentId,
    });
  });

  it('executeFirstSearch dispatches #executeSearch', () => {
    const executeSearch = jest.spyOn(SearchActions, 'executeSearch');

    search.executeFirstSearch();

    expect(executeSearch).toHaveBeenCalled();
  });
});
