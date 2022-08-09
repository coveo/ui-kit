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

    it('it does not dispatch #executeSearch and #logTriggerQuery', () => {
      expect(engine.findAsyncAction(executeSearch.pending)).toBeFalsy();
    });

    it('#state.wasQueryModified should be false', () => {
      expect(queryTrigger.state.wasQueryModified).toEqual(false);
    });
  });

  describe('when a search is performed with a query trigger', () => {
    const listener = jest.fn();
    const originalQuery = 'yellow fruit';
    const newQuery = 'bananas';
    beforeEach(() => {
      engine = buildMockSearchAppEngine();
      initQueryTrigger();
      queryTrigger.subscribe(listener);
      const [firstListener] = registeredListeners();

      engine.state.query.q = originalQuery;
      engine.state.triggers.query = newQuery;
      firstListener();
    });

    it('it calls the listener', () => {
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('it dispatches #updateQuery', () => {
      expect(getUpdateQueryAction()).toBeTruthy();
    });

    it('it dispatches #executeSearch and #logTriggerQuery', () => {
      expect(engine.findAsyncAction(executeSearch.pending)).toBeTruthy();
    });

    it('#state.wasQueryModified should be true', () => {
      expect(queryTrigger.state.wasQueryModified).toEqual(true);
    });

    it("#state.originalQuery should be the user's query", () => {
      expect(queryTrigger.state.originalQuery).toEqual(originalQuery);
    });

    it('#state.originalQuery should be the new query', () => {
      expect(queryTrigger.state.newQuery).toEqual(newQuery);
    });

    describe('when the corrected search resolves', () => {
      beforeEach(() => {
        listener.mockReset();
        const [firstListener] = registeredListeners();

        engine.state.query.q = newQuery;
        engine.state.triggers.query = '';
        firstListener();
      });

      it('it does not call the listener', () => {
        expect(listener).toHaveBeenCalledTimes(0);
      });

      it('#state.wasQueryModified should be true', () => {
        expect(queryTrigger.state.wasQueryModified).toEqual(true);
      });

      describe('when a different search is performed', () => {
        beforeEach(() => {
          const [firstListener] = registeredListeners();

          engine.state.query.q = 'Oranges';
          engine.state.triggers.query = '';
          firstListener();
        });

        it('it calls the listener', () => {
          expect(listener).toHaveBeenCalledTimes(1);
        });

        it('#state.wasQueryModified should be false', () => {
          expect(queryTrigger.state.wasQueryModified).toEqual(false);
        });
      });
    });
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

    it('it does not call the listener', () => {
      expect(listener).toHaveBeenCalledTimes(0);
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
