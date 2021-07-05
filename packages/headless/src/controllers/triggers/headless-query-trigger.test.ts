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

  describe('when the #engine.state.triggers.query is not updated', () => {
    const listener = jest.fn();
    beforeEach(() => {
      engine = buildMockSearchAppEngine();
      initQueryTrigger();
      queryTrigger.subscribe(listener);

      const [firstListener] = registeredListeners();
      firstListener();
    });

    it('it does not call the listener', () => {
      expect(listener).toHaveBeenCalledTimes(0);
    });

    it('it does not dispatch #updateQuery', () => {
      expect(getUpdateQueryAction()).toBeFalsy();
    });

    it('it does not dispatch #executeSearch and #logQueryTrigger', () => {
      expect(engine.findAsyncAction(executeSearch.pending)).toBeFalsy();
    });

    it('#state.wasQueryModified should be false', () => {
      expect(queryTrigger.state.wasQueryModified).toEqual(false);
    });
  });

  describe('when the #engine.state.triggers.query is updated', () => {
    const listener = jest.fn();
    beforeEach(() => {
      engine = buildMockSearchAppEngine();
      initQueryTrigger();
      queryTrigger.subscribe(listener);
      engine.state.triggers.query = 'bananas';

      const [firstListener] = registeredListeners();
      firstListener();
    });

    it('it calls the listener', () => {
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('it dispatches #updateQuery', () => {
      expect(getUpdateQueryAction()).toBeTruthy();
    });

    it('it dispatches #executeSearch and #logQueryTrigger', () => {
      expect(engine.findAsyncAction(executeSearch.pending)).toBeTruthy();
    });

    it('#state.wasQueryModified should be true', () => {
      expect(queryTrigger.state.wasQueryModified).toEqual(true);
    });
  });

  describe('when the #engine.state.triggers.query is updated to the empty string', () => {
    const listener = jest.fn();
    beforeEach(() => {
      engine = buildMockSearchAppEngine();
      initQueryTrigger();
      queryTrigger.subscribe(listener);
      engine.state.triggers.query = '';

      const [firstListener] = registeredListeners();
      firstListener();
    });

    it('it does not call the listener', () => {
      expect(listener).toHaveBeenCalledTimes(0);
    });

    it('it does not dispatch #updateQuery', () => {
      expect(getUpdateQueryAction()).toBeFalsy();
    });

    it('it does not dispatch #executeSearch and #logQueryTrigger', () => {
      expect(engine.findAsyncAction(executeSearch.pending)).toBeFalsy();
    });

    it('#state.wasQueryModified should be false', () => {
      expect(queryTrigger.state.wasQueryModified).toEqual(false);
    });
  });
});
