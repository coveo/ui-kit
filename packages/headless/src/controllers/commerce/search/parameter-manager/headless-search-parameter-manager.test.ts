import {Action} from '@reduxjs/toolkit';
import {queryReducer as commerceQuery} from '../../../../features/commerce/query/query-slice';
import {
  CommerceSearchParameters,
  restoreSearchParameters,
} from '../../../../features/commerce/search-parameters/search-parameter-actions';
import {executeSearch} from '../../../../features/commerce/search/search-actions';
import {buildMockCommerceEngine, MockCommerceEngine} from '../../../../test';
import {ParameterManager} from '../../core/parameter-manager/headless-core-parameter-manager';
import {buildSearchParameterManager} from './headless-search-parameter-manager';

describe('search parameter manager', () => {
  let engine: MockCommerceEngine;
  let searchParameterManager: ParameterManager<CommerceSearchParameters>;

  function initSearchParameterManager() {
    engine = buildMockCommerceEngine();

    searchParameterManager = buildSearchParameterManager(engine, {
      initialState: {parameters: {}},
    });
  }

  const expectContainAction = (action: Action) => {
    const found = engine.actions.find((a) => a.type === action.type);
    expect(engine.actions).toContainEqual(found);
  };

  beforeEach(() => {
    initSearchParameterManager();
  });

  it('exposes #subscribe method', () => {
    expect(searchParameterManager.subscribe).toBeTruthy();
  });

  it('adds #commerceQuery reducer to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({commerceQuery});
  });

  it('dispatches #restoreSearchParameters on init', () => {
    expectContainAction(restoreSearchParameters({}));
  });

  describe('#synchronize', () => {
    it('dispatches #restoreSearchParameters', () => {
      const parameters = {
        q: 'some query',
      };
      searchParameterManager.synchronize(parameters);
      expectContainAction(
        restoreSearchParameters({
          q: 'some query',
        })
      );
    });

    it('dispatches #executeSearch', () => {
      const parameters = {
        q: 'some query',
      };
      searchParameterManager.synchronize(parameters);
      const action = engine.findAsyncAction(executeSearch.pending);
      expect(action).toBeTruthy();
    });
  });

  it('#state contains #parameters', () => {
    expect(searchParameterManager.state.parameters).toEqual({});
  });
});
