import {Action} from '@reduxjs/toolkit';
import {
  CommerceSearchParameters,
  restoreSearchParameters,
} from '../../../../features/commerce/search-parameters/search-parameter-actions';
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

  it('dispatches #restoreSearchParameters on init', () => {
    expectContainAction(restoreSearchParameters({}));
  });

  it('#synchronize dispatches #restoreSearchParameters', () => {
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

  it('#state contains #parameters', () => {
    expect(searchParameterManager.state.parameters).toEqual({});
  });
});
