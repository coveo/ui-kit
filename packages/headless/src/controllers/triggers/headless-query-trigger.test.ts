import {QueryTrigger, buildQueryTrigger} from './headless-query-trigger';
import {
  buildMockSearchAppEngine,
  MockSearchEngine,
} from '../../test/mock-engine';
import {triggers, query} from '../../app/reducers';
import {updateQuery} from '../../features/query/query-actions';
import {executeSearch} from '../../features/search/search-actions';

describe('QueryTrigger', () => {
  let engine: MockSearchEngine;
  let queryTrigger: QueryTrigger;

  function initQueryTrigger() {
    queryTrigger = buildQueryTrigger(engine);
  }

  function getUpdateQueryAction() {
    return engine.actions.find((a) => a.type === updateQuery.type);
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

  it('when the #engine.state.triggers.query is not updated, it does not dispatch #updateQuery, #executeSearch, and #logQueryTrigger', () => {
    const listener = jest.fn();
    queryTrigger.subscribe(listener);

    const [firstListener] = registeredListeners();
    firstListener();

    expect(listener).toHaveBeenCalledTimes(0);
    expect(getUpdateQueryAction()).toBeFalsy();
    expect(engine.findAsyncAction(executeSearch.pending)).toBeFalsy();
  });

  it('when the #engine.state.triggers.query is updated, it dispatches #updateQuery, #executeSearch, and #logQueryTrigger', () => {
    const listener = jest.fn();
    queryTrigger.subscribe(listener);

    engine.state.triggers.query = 'bananas';
    const [firstListener] = registeredListeners();
    firstListener();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(getUpdateQueryAction()).toBeTruthy();
    expect(engine.findAsyncAction(executeSearch.pending)).toBeTruthy();
  });

  it('when the #engine.state.triggers.query is updated to the empty string, it does not dispatch #updateQuery, #executeSearch, and #logQueryTrigger', () => {
    const listener = jest.fn();
    queryTrigger.subscribe(listener);

    engine.state.triggers.query = '';
    const [firstListener] = registeredListeners();
    firstListener();

    expect(listener).toHaveBeenCalledTimes(0);
    expect(getUpdateQueryAction()).toBeFalsy();
    expect(engine.findAsyncAction(executeSearch.pending)).toBeFalsy();
  });
});
