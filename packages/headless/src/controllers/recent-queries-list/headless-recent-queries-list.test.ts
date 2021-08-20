import {buildMockSearchAppEngine, MockSearchEngine} from '../../test';
import {
  buildRecentQueriesList,
  RecentQueriesList,
} from './headless-recent-queries-list';
import {search, recentQueries} from '../../app/reducers';
import {
  clearRecentQueries,
  registerRecentQueries,
} from '../../features/recent-queries/recent-queries-actions';
import {Action} from 'redux';
import {updateQuery} from '../../features/query/query-actions';
import {executeSearch} from '../../features/search/search-actions';
import {logClearRecentQueries} from '../../features/recent-queries/recent-queries-analytics-actions';

describe('recent queries list', () => {
  let engine: MockSearchEngine;
  let recentQueriesList: RecentQueriesList;

  const expectContainAction = (action: Action) => {
    const found = engine.actions.find((a) => a.type === action.type);
    expect(engine.actions).toContainEqual(found);
  };

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
  });

  it('adds the correct reducers to the engine', () => {
    recentQueriesList = buildRecentQueriesList(engine);

    expect(engine.addReducers).toHaveBeenCalledWith({search, recentQueries});
  });

  describe('without props', () => {
    beforeEach(() => {
      recentQueriesList = buildRecentQueriesList(engine);
    });

    it('should register with default props on init', () => {
      expect(engine.actions).toContainEqual(
        registerRecentQueries({
          queries: [],
          maxLength: 10,
        })
      );
    });

    it('#state.queries initial state is empty', () => {
      expect(recentQueriesList.state.queries.length).toBe(0);
    });

    it('#state.maxLength initial state is 10', () => {
      expect(recentQueriesList.state.maxLength).toBe(10);
    });
  });

  describe('with props', () => {
    const testInitialState = {
      queries: ['first query', 'second query'],
    };
    const testOptions = {
      maxLength: 5,
    };
    const testProps = {
      initialState: testInitialState,
      options: testOptions,
    };

    beforeEach(() => {
      recentQueriesList = buildRecentQueriesList(engine, testProps);
    });

    it('should register with props on init', () => {
      expect(engine.actions).toContainEqual(
        registerRecentQueries({
          queries: testProps.initialState.queries,
          maxLength: testProps.options.maxLength,
        })
      );
    });

    it('#clear should log analytics and dispatch clear action', () => {
      recentQueriesList.clear();

      expectContainAction(clearRecentQueries);
      expect(recentQueriesList.state.queries.length).toBe(0);
      engine.findAsyncAction(logClearRecentQueries().pending);
    });

    it('#executeRecentQuery should execute the query and log proper analytics', () => {
      engine.state.recentQueries = {...testInitialState, ...testOptions};
      recentQueriesList.executeRecentQuery(0);

      expectContainAction(updateQuery);
      expect(engine.actions).toContainEqual(
        updateQuery({q: testInitialState.queries[0]})
      );
      engine.findAsyncAction(executeSearch.pending);
    });
  });
});
