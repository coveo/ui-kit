import {updateQuery} from '../../features/query/query-actions';
import {queryReducer as query} from '../../features/query/query-slice';
import {executeSearch} from '../../features/search/search-actions';
import {triggerReducer as triggers} from '../../features/triggers/triggers-slice';
import {
  buildMockSearchEngine,
  MockedSearchEngine,
} from '../../test/mock-engine-v2';
import {createMockState} from '../../test/mock-state';
import {QueryTrigger} from '../core/triggers/headless-core-query-trigger';
import {buildQueryTrigger} from './headless-query-trigger';

jest.mock('../../features/query/query-actions');
jest.mock('../../features/search/search-actions');

describe('QueryTrigger', () => {
  let engine: MockedSearchEngine;
  let queryTrigger: QueryTrigger;

  function initQueryTrigger() {
    queryTrigger = buildQueryTrigger(engine);
  }

  function registeredListeners() {
    return (engine.subscribe as jest.Mock).mock.calls.map((args) => args[0]);
  }

  beforeEach(() => {
    engine = buildMockSearchEngine(createMockState());
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
      engine = buildMockSearchEngine(createMockState());
      initQueryTrigger();
      queryTrigger.subscribe(listener);
      engine.state.query!.q = 'Oranges';
      engine.state.triggers!.query = '';

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
