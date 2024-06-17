import {stateKey} from '../../../app/state-key';
import {updateQuery} from '../../../features/commerce/query/query-actions';
import {queryReducer as query} from '../../../features/commerce/query/query-slice';
import {executeSearch} from '../../../features/commerce/search/search-actions';
import {commerceTriggersReducer as triggers} from '../../../features/commerce/triggers/triggers-slice';
import {buildMockCommerceState} from '../../../test/mock-commerce-state';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../test/mock-engine-v2';
import {QueryTrigger} from '../../core/triggers/headless-core-query-trigger';
import {buildQueryTrigger} from './headless-commerce-query-trigger';

jest.mock('../../../features/commerce/query/query-actions');
jest.mock('../../../features/commerce/search/search-actions');

describe('commerce query trigger', () => {
  let engine: MockedCommerceEngine;
  let queryTrigger: QueryTrigger;

  function initQueryTrigger() {
    queryTrigger = buildQueryTrigger(engine);
  }

  function registeredListeners() {
    return (engine.subscribe as jest.Mock).mock.calls.map((args) => args[0]);
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
    const listener = jest.fn();
    beforeEach(() => {
      engine = buildMockCommerceEngine(buildMockCommerceState());
      initQueryTrigger();
      queryTrigger.subscribe(listener);
      console.log(engine[stateKey]);
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
