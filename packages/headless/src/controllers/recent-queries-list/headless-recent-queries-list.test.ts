import {
  logClearRecentQueries,
  logRecentQueryClick,
} from '../../features/recent-queries/recent-queries-analytics-actions.js';
import {executeSearch} from '../../features/search/search-actions.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../test/mock-engine-v2.js';
import {createMockState} from '../../test/mock-state.js';
import {buildCoreRecentQueriesList} from '../core/recent-queries-list/headless-core-recent-queries-list.js';
import {
  buildRecentQueriesList,
  type RecentQueriesList,
} from './headless-recent-queries-list.js';

vi.mock('../../features/search/search-actions.js');
vi.mock('../../features/recent-queries/recent-queries-analytics-actions');
vi.mock('../core/recent-queries-list/headless-core-recent-queries-list.js');

describe('recent queries list', () => {
  let engine: MockedSearchEngine;
  let mockCoreController: RecentQueriesList;
  let recentQueriesList: RecentQueriesList;

  const testProps = {
    initialState: {
      queries: ['first query', 'second query'],
    },
    options: {
      maxLength: 5,
      clearFilters: true,
    },
  };

  beforeEach(() => {
    engine = buildMockSearchEngine(createMockState());

    // Create a mock core controller
    mockCoreController = {
      clear: vi.fn(),
      executeRecentQuery: vi.fn(),
      updateRecentQueries: vi.fn(),
      subscribe: vi.fn(),
      state: {
        queries: ['query1', 'query2'],
        maxLength: 10,
        analyticsEnabled: true,
      },
    };

    // Mock the buildCoreRecentQueriesList function
    vi.mocked(buildCoreRecentQueriesList).mockReturnValue(mockCoreController);
  });

  it('should call buildCoreRecentQueriesList with correct arguments', () => {
    recentQueriesList = buildRecentQueriesList(engine, testProps);

    expect(buildCoreRecentQueriesList).toHaveBeenCalledWith(engine, testProps);
  });

  it('should call buildCoreRecentQueriesList with no props when none provided', () => {
    recentQueriesList = buildRecentQueriesList(engine);

    expect(buildCoreRecentQueriesList).toHaveBeenCalledWith(engine, undefined);
  });

  it('should expose the core controller state', () => {
    recentQueriesList = buildRecentQueriesList(engine, testProps);

    expect(recentQueriesList.state).toBe(mockCoreController.state);
  });

  describe('#clear', () => {
    beforeEach(() => {
      recentQueriesList = buildRecentQueriesList(engine, testProps);
    });

    it('should log analytics action and call core clear method', () => {
      recentQueriesList.clear();

      expect(logClearRecentQueries).toHaveBeenCalled();
      expect(mockCoreController.clear).toHaveBeenCalled();
    });
  });

  describe('#executeRecentQuery', () => {
    beforeEach(() => {
      recentQueriesList = buildRecentQueriesList(engine, testProps);
    });

    it('should call core executeRecentQuery and dispatch insight search with analytics', () => {
      const index = 0;

      recentQueriesList.executeRecentQuery(index);

      expect(mockCoreController.executeRecentQuery).toHaveBeenCalledWith(index);
      expect(executeSearch).toHaveBeenCalledWith({
        legacy: logRecentQueryClick(),
        next: {
          actionCause: 'recentQueriesClick',
        },
      });
    });
  });
});
