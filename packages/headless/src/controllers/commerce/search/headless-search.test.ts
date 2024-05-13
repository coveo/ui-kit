import {configuration} from '../../../app/common-reducers';
import {contextReducer as commerceContext} from '../../../features/commerce/context/context-slice';
import {queryReducer as commerceQuery} from '../../../features/commerce/query/query-slice';
import * as SearchActions from '../../../features/commerce/search/search-actions';
import {responseIdSelector} from '../../../features/commerce/search/search-selectors';
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
    });
  });

  // eslint-disable-next-line @cspell/spellchecker
  // TODO CAPI-244: Handle analytics
  it('executeFirstSearch dispatches #executeSearch', () => {
    const executeSearch = jest.spyOn(SearchActions, 'executeSearch');

    search.executeFirstSearch();

    expect(executeSearch).toHaveBeenCalled();
  });
});
