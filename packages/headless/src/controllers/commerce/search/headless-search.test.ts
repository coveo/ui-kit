import {Action} from '@reduxjs/toolkit';
import {configuration} from '../../../app/common-reducers';
import {contextReducer as commerceContext} from '../../../features/commerce/context/context-slice';
import {queryReducer as commerceQuery} from '../../../features/commerce/query/query-slice';
import {executeSearch} from '../../../features/commerce/search/search-actions';
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

  const expectContainAction = (action: Action) => {
    const found = engine.actions.find((a) => a.type === action.type);
    expect(engine.actions).toContainEqual(found);
  };

  it('adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      commerceContext,
      configuration,
      commerceSearch,
      commerceQuery,
    });
  });

  // eslint-disable-next-line @cspell/spellchecker
  // TODO CAPI-244: Handle analytics
  it('executeFirstSearch dispatches #executeSearch', () => {
    search.executeFirstSearch();
    expectContainAction(executeSearch.pending);
  });
});
