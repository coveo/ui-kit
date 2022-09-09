import {QueryTrigger, buildQueryTrigger} from './headless-query-trigger';
import {
  buildMockSearchAppEngine,
  MockSearchEngine,
} from '../../test/mock-engine';
import {triggers, query} from '../../app/reducers';
import {updateQuery} from '../../features/query/query-actions';
import {executeSearch} from '../../features/search/search-actions';
import {AnyAction} from 'redux';

describe('QueryTrigger', () => {
  let engine: MockSearchEngine;
  let queryTrigger: QueryTrigger;

  function initQueryTrigger() {
    queryTrigger = buildQueryTrigger(engine);
  }

  function getUpdateQueryAction() {
    function isUpdateQueryAction(
      action: AnyAction
    ): action is ReturnType<typeof updateQuery> {
      return action.type === updateQuery.type;
    }
    return engine.actions.find(isUpdateQueryAction);
  }

  function registeredListeners() {
    return (engine.subscribe as jest.Mock).mock.calls.map((args) => args[0]);
  }

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
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
      engine = buildMockSearchAppEngine();
      initQueryTrigger();
      queryTrigger.subscribe(listener);
      engine.state.query.q = 'Oranges';
      engine.state.triggers.query = '';

      const [firstListener] = registeredListeners();
      firstListener();
    });

    it('it does not dispatch #updateQuery', () => {
      expect(getUpdateQueryAction()).toBeFalsy();
    });

    it('it does not dispatch #executeSearch and #logTriggerQuery', () => {
      expect(engine.findAsyncAction(executeSearch.pending)).toBeFalsy();
    });

    it('#state.wasQueryModified should be false', () => {
      expect(queryTrigger.state.wasQueryModified).toEqual(false);
    });
  });
});
