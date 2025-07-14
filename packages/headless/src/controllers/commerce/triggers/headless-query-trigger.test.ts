import type {Mock} from 'vitest';
import {stateKey} from '../../../app/state-key.js';
import {updateQuery} from '../../../features/commerce/query/query-actions.js';
import {queryReducer as query} from '../../../features/commerce/query/query-slice.js';
import {executeSearch} from '../../../features/commerce/search/search-actions.js';
import {commerceTriggersReducer as triggers} from '../../../features/commerce/triggers/triggers-slice.js';
import {buildMockCommerceState} from '../../../test/mock-commerce-state.js';
import {
  buildMockCommerceEngine,
  type MockedCommerceEngine,
} from '../../../test/mock-engine-v2.js';
import type {QueryTrigger} from '../../core/triggers/headless-core-query-trigger.js';
import {buildQueryTrigger} from './headless-query-trigger.js';

vi.mock('../../../features/commerce/query/query-actions');
vi.mock('../../../features/commerce/search/search-actions');

describe('commerce query trigger', () => {
  let engine: MockedCommerceEngine;
  let queryTrigger: QueryTrigger;

  function initQueryTrigger() {
    queryTrigger = buildQueryTrigger(engine);
  }

  function registeredListeners() {
    return (engine.subscribe as Mock).mock.calls.map((args) => args[0]);
  }

  beforeEach(() => {
    engine = buildMockCommerceEngine(buildMockCommerceState());
    initQueryTrigger();
  });

  it('initializes', () => {
    expect(queryTrigger).toBeTruthy();
  });

  it('it adds the correct reducers to the engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      triggers,
      query,
    });
  });

  it('exposes a #subscribe method', () => {
    expect(queryTrigger.subscribe).toBeTruthy();
  });

  describe('when a search without a trigger is performed', () => {
    const listener = vi.fn();
    beforeEach(() => {
      engine = buildMockCommerceEngine(buildMockCommerceState());
      initQueryTrigger();
      queryTrigger.subscribe(listener);
      engine[stateKey].commerceQuery.query = 'Oranges';
      engine[stateKey].triggers!.query = '';

      const [firstListener] = registeredListeners();
      firstListener();
    });

    it('it does not dispatch #updateQuery', () => {
      expect(updateQuery).not.toHaveBeenCalled();
    });

    it('it does not dispatch #executeSearch', () => {
      expect(executeSearch).not.toHaveBeenCalled();
    });

    it('#state.wasQueryModified should be false', () => {
      expect(queryTrigger.state.wasQueryModified).toEqual(false);
    });
  });
});
