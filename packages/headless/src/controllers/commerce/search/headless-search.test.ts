import {Action} from '@reduxjs/toolkit';
import {configuration} from '../../../app/common-reducers';
import {CommerceSearchAction} from '../../../features/analytics/analytics-utils';
import {contextReducer as commerceContext} from '../../../features/commerce/context/context-slice';
import {queryReducer as commerceQuery} from '../../../features/commerce/query/query-slice';
import {executeSearch} from '../../../features/commerce/search/search-actions';
import {
  logInterfaceLoad,
  logOmniboxFromLink,
  logSearchFromLink,
} from '../../../features/commerce/search/search-analytics-actions';
import {commerceSearchReducer as commerceSearch} from '../../../features/commerce/search/search-slice';
import {buildMockCommerceEngine, MockCommerceEngine} from '../../../test';
import {buildSearch, Search} from './headless-search';

describe('headless search', () => {
  let search: Search;
  let engine: MockCommerceEngine;

  beforeEach(() => {
    engine = buildMockCommerceEngine();
    search = buildSearch(engine);
  });

  const expectContainActionWithAnalytics = (
    action: Action,
    analyticsAction: CommerceSearchAction
  ) => {
    const found = engine.actions.find((a) => a.type === action.type);
    expect(engine.actions).toContainEqual(found);
    expect(found!.meta.arg.typePrefix).toEqual(analyticsAction.typePrefix);
  };

  it('adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      commerceContext,
      configuration,
      commerceSearch,
      commerceQuery,
    });
  });

  describe('#executeFirstSearch', () => {
    it('does not dispatch #executeSearch if is not first search', () => {
      engine.state.commerceSearch.responseId = 'some-response-id';
      search.executeFirstSearch();
      expect(engine.actions).toHaveLength(0);
    });

    it('dispatches #executeSearch with #logInterfaceLoad', () => {
      search.executeFirstSearch();
      expectContainActionWithAnalytics(
        executeSearch.pending,
        logInterfaceLoad()
      );
    });

    it('dispatches #executeSearch with analytics when provided', () => {
      const analyticsAction = logSearchFromLink();
      search.executeFirstSearch(analyticsAction);

      expectContainActionWithAnalytics(executeSearch.pending, analyticsAction);
    });
  });

  describe('#executeFirstSearchAfterStandaloneSearchBoxRedirect', () => {
    it('dispatches #executeSearch with #logSearchFromLink', () => {
      search.executeFirstSearchAfterStandaloneSearchBoxRedirect({
        cause: '',
        metadata: null,
      });

      expectContainActionWithAnalytics(
        executeSearch.pending,
        logSearchFromLink()
      );
    });

    it('dispatches #executeSearch with #logOmniboxFromLink when cause is "omniboxFromLink"', () => {
      const metadata = {
        suggestionRanking: 0,
        partialQueries: '',
        suggestions: '',
        partialQuery: '',
        querySuggestResponseId: '',
      };
      search.executeFirstSearchAfterStandaloneSearchBoxRedirect({
        cause: 'omniboxFromLink',
        metadata,
      });

      expectContainActionWithAnalytics(
        executeSearch.pending,
        logOmniboxFromLink(metadata)
      );
    });
  });
});
