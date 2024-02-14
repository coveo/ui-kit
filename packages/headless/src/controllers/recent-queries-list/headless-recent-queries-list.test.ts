import {NumberValue} from '@coveo/bueno';
import {deselectAllBreadcrumbs} from '../../features/breadcrumb/breadcrumb-actions';
import {
  clearRecentQueries,
  registerRecentQueries,
} from '../../features/recent-queries/recent-queries-actions';
import {logClearRecentQueries} from '../../features/recent-queries/recent-queries-analytics-actions';
import {recentQueriesReducer as recentQueries} from '../../features/recent-queries/recent-queries-slice';
import {prepareForSearchWithQuery} from '../../features/search/search-actions';
import {searchReducer as search} from '../../features/search/search-slice';
import {
  buildMockSearchEngine,
  MockedSearchEngine,
} from '../../test/mock-engine-v2';
import {createMockState} from '../../test/mock-state';
import {
  buildRecentQueriesList,
  RecentQueriesList,
} from './headless-recent-queries-list';

jest.mock('../../features/recent-queries/recent-queries-actions');
jest.mock('../../features/breadcrumb/breadcrumb-actions');
jest.mock('../../features/search/search-actions');
jest.mock('../../features/recent-queries/recent-queries-analytics-actions');

describe('recent queries list', () => {
  let engine: MockedSearchEngine;
  let recentQueriesList: RecentQueriesList;

  beforeEach(() => {
    engine = buildMockSearchEngine(createMockState());
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
      expect(registerRecentQueries).toHaveBeenCalledWith({
        queries: [],
        maxLength: 10,
      });
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
      clearFilters: true,
    };
    const testProps = {
      initialState: testInitialState,
      options: testOptions,
    };

    beforeEach(() => {
      recentQueriesList = buildRecentQueriesList(engine, testProps);
    });

    it('should register with props on init', () => {
      expect(registerRecentQueries).toHaveBeenCalledWith({
        queries: testProps.initialState.queries,
        maxLength: testProps.options.maxLength,
      });
    });

    it('#clear should log analytics and dispatch clear action', () => {
      recentQueriesList.clear();
      expect(clearRecentQueries).toHaveBeenCalled();

      expect(recentQueriesList.state.queries.length).toBe(0);
      expect(logClearRecentQueries).toHaveBeenCalled();
    });

    it('#executeRecentQuery should validate the given index parameter', () => {
      const validationSpy = jest.spyOn(NumberValue.prototype, 'validate');
      engine.state.recentQueries = {...testInitialState, ...testOptions};

      expect(() => recentQueriesList.executeRecentQuery(100)).toThrow();
      expect(validationSpy).toBeCalled();
    });

    it('#executeRecentQuery should execute #prepareForSearchWithQuery with the proper parameters', () => {
      engine.state.recentQueries = {...testInitialState, ...testOptions};
      recentQueriesList.executeRecentQuery(0);
      expect(prepareForSearchWithQuery).toHaveBeenCalledWith({
        q: testInitialState.queries[0],
        clearFilters: testOptions.clearFilters,
      });
    });

    it('should not clear filters if the #clearFilters option is false', () => {
      recentQueriesList = buildRecentQueriesList(engine, {
        options: {clearFilters: false, maxLength: 10},
      });
      recentQueriesList.executeRecentQuery(0);
      expect(deselectAllBreadcrumbs).not.toHaveBeenCalled();
    });
  });
});
