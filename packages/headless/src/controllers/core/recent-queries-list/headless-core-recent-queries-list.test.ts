import {ArrayValue, NumberValue} from '@coveo/bueno';
import {deselectAllBreadcrumbs} from '../../../features/breadcrumb/breadcrumb-actions.js';
import {queryReducer as query} from '../../../features/query/query-slice.js';
import {
  clearRecentQueries,
  registerRecentQueries,
} from '../../../features/recent-queries/recent-queries-actions.js';
import {recentQueriesReducer as recentQueries} from '../../../features/recent-queries/recent-queries-slice.js';
import {prepareForSearchWithQuery} from '../../../features/search/search-actions.js';
import {searchReducer as search} from '../../../features/search/search-slice.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../../test/mock-engine-v2.js';
import {buildMockQueryState} from '../../../test/mock-query-state.js';
import {createMockState} from '../../../test/mock-state.js';
import {
  buildCoreRecentQueriesList,
  type RecentQueriesList,
} from './headless-core-recent-queries-list.js';

vi.mock('../../../features/recent-queries/recent-queries-actions');
vi.mock('../../../features/breadcrumb/breadcrumb-actions');
vi.mock('../../../features/search/search-actions');

describe('recent queries list', () => {
  let engine: MockedSearchEngine;
  let recentQueriesList: RecentQueriesList;

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
  const mockedPrepareForSearchWithQuery = vi.mocked(prepareForSearchWithQuery);

  beforeEach(() => {
    engine = buildMockSearchEngine(createMockState());
    recentQueriesList = buildCoreRecentQueriesList(engine);
  });

  afterEach(() => {
    mockedPrepareForSearchWithQuery.mockClear();
  });

  it('adds the correct reducers to the engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      search,
      recentQueries,
      query,
    });
  });

  describe('without props', () => {
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
    beforeEach(() => {
      recentQueriesList = buildCoreRecentQueriesList(engine, testProps);
    });

    it('should register with props on init', () => {
      expect(registerRecentQueries).toHaveBeenCalledWith({
        queries: testProps.initialState.queries,
        maxLength: testProps.options.maxLength,
      });
    });
  });

  describe('#executeRecentQuery', () => {
    it('#executeRecentQuery should validate the given index parameter', () => {
      const validationSpy = vi.spyOn(NumberValue.prototype, 'validate');
      engine.state.recentQueries = {...testInitialState, ...testOptions};

      expect(() => recentQueriesList.executeRecentQuery(100)).toThrow();
      expect(validationSpy).toHaveBeenCalled();
    });

    it('#executeRecentQuery should execute #prepareForSearchWithQuery with the proper parameters', () => {
      engine.state.query = buildMockQueryState();
      engine.state.recentQueries = {...testInitialState, ...testOptions};
      recentQueriesList.executeRecentQuery(0);
      expect(mockedPrepareForSearchWithQuery).toHaveBeenCalledTimes(1);
      expect(mockedPrepareForSearchWithQuery).toHaveBeenCalledWith({
        q: testInitialState.queries[0],
        clearFilters: testOptions.clearFilters,
        enableQuerySyntax: false,
      });
    });

    it('#executeRecentQuery should execute #prepareForSearchWithQuery with the proper enableQuerySyntax parameter', () => {
      engine.state.query = buildMockQueryState({enableQuerySyntax: true});
      recentQueriesList = buildCoreRecentQueriesList(engine);
      recentQueriesList.executeRecentQuery(0);
      expect(mockedPrepareForSearchWithQuery).toHaveBeenCalledTimes(1);
      expect(mockedPrepareForSearchWithQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          enableQuerySyntax: true,
        })
      );
    });

    it('should not clear filters if the #clearFilters option is false', () => {
      recentQueriesList = buildCoreRecentQueriesList(engine, {
        options: {clearFilters: false, maxLength: 10},
      });
      recentQueriesList.executeRecentQuery(0);
      expect(deselectAllBreadcrumbs).not.toHaveBeenCalled();
    });
  });

  describe('#clear', () => {
    it('#clear should dispatch clear action', () => {
      recentQueriesList.clear();

      expect(clearRecentQueries).toHaveBeenCalled();
      expect(recentQueriesList.state.queries.length).toBe(0);
    });
  });

  describe('#updateRecentQueries', () => {
    const validQueries = ['query1', 'query2', 'query3'];
    const invalidQueries = [123, null, undefined];

    beforeEach(() => {
      recentQueriesList = buildCoreRecentQueriesList(engine, {
        options: {maxLength: 5},
      });
    });

    it('should validate the queries array and throw an error if invalid', () => {
      const validationSpy = vi.spyOn(ArrayValue.prototype, 'validate');

      expect(() =>
        // @ts-expect-error invalid queries
        recentQueriesList.updateRecentQueries(invalidQueries)
      ).toThrow();
      expect(validationSpy).toHaveBeenCalledWith(invalidQueries);
    });

    it('should dispatch the registerRecentQueries action with valid queries', () => {
      recentQueriesList.updateRecentQueries(validQueries);

      expect(registerRecentQueries).toHaveBeenCalledWith({
        queries: validQueries,
        maxLength: 5,
      });
    });

    it('should throw an error if the queries array is empty', () => {
      expect(() => recentQueriesList.updateRecentQueries([])).toThrow(
        'value contains less than 1'
      );
    });
  });
});
