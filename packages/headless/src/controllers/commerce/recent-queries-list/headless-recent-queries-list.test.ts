import {ArrayValue, NumberValue} from '@coveo/bueno';
import {stateKey} from '../../../app/state-key.js';
import {clearAllCoreFacets} from '../../../features/commerce/facets/core-facet/core-facet-actions.js';
import {
  clearRecentQueries,
  registerRecentQueries,
} from '../../../features/commerce/recent-queries/recent-queries-actions.js';
import {recentQueriesReducer as recentQueries} from '../../../features/commerce/recent-queries/recent-queries-slice.js';
import {prepareForSearchWithQuery} from '../../../features/commerce/search/search-actions.js';
import {commerceSearchReducer as search} from '../../../features/commerce/search/search-slice.js';
import {buildMockCommerceState} from '../../../test/mock-commerce-state.js';
import {
  buildMockCommerceEngine,
  type MockedCommerceEngine,
} from '../../../test/mock-engine-v2.js';
import {buildMockQueryState} from '../../../test/mock-query-state.js';
import {
  buildRecentQueriesList,
  type RecentQueriesList,
} from './headless-recent-queries-list.js';

vi.mock('../../../features/commerce/facets/core-facet/core-facet-actions');
vi.mock('../../../features/commerce/search/search-actions');
vi.mock('../../../features/commerce/recent-queries/recent-queries-actions');

describe('recent queries list', () => {
  let engine: MockedCommerceEngine;
  let recentQueriesList: RecentQueriesList;

  beforeEach(() => {
    engine = buildMockCommerceEngine(buildMockCommerceState());
  });

  it('adds the correct reducers to the engine', () => {
    recentQueriesList = buildRecentQueriesList(engine);

    expect(engine.addReducers).toHaveBeenCalledWith({search, recentQueries});
  });

  describe('without props', () => {
    beforeEach(() => {
      recentQueriesList = buildRecentQueriesList(engine);
    });

    it('dispatches #registerRecentQueries with default props upon initialization', () => {
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
    const mockedPrepareForSearchWithQuery = vi.mocked(
      prepareForSearchWithQuery
    );

    beforeEach(() => {
      recentQueriesList = buildRecentQueriesList(engine, testProps);
    });

    afterEach(() => {
      mockedPrepareForSearchWithQuery.mockClear();
    });

    it('dispatches #registerRecentQueries with props upon initialization', () => {
      expect(registerRecentQueries).toHaveBeenCalledWith({
        queries: testProps.initialState.queries,
        maxLength: testProps.options.maxLength,
      });
    });

    it('#clear dispatches #clearRecentQueries', () => {
      recentQueriesList.clear();
      expect(clearRecentQueries).toHaveBeenCalled();

      expect(recentQueriesList.state.queries.length).toBe(0);
    });

    it('#executeRecentQuery should validate the given index parameter', () => {
      const validationSpy = vi.spyOn(NumberValue.prototype, 'validate');
      engine[stateKey].recentQueries = {...testInitialState, ...testOptions};

      expect(() => recentQueriesList.executeRecentQuery(100)).toThrow();
      expect(validationSpy).toHaveBeenCalled();
    });

    it('#executeRecentQuery should dispatch #prepareForSearchWithQuery with the proper parameters', () => {
      engine[stateKey].query = buildMockQueryState();
      engine[stateKey].recentQueries = {...testInitialState, ...testOptions};
      recentQueriesList.executeRecentQuery(0);
      expect(mockedPrepareForSearchWithQuery).toHaveBeenCalledTimes(1);
      expect(mockedPrepareForSearchWithQuery).toHaveBeenCalledWith({
        query: testInitialState.queries[0],
        clearFilters: testOptions.clearFilters,
      });
    });

    it('should not clear filters if the #clearFilters option is false', () => {
      recentQueriesList = buildRecentQueriesList(engine, {
        options: {clearFilters: false, maxLength: 10},
      });
      recentQueriesList.executeRecentQuery(0);
      expect(clearAllCoreFacets).not.toHaveBeenCalled();
    });
  });

  describe('#updateRecentQueries', () => {
    const validQueries = ['query1', 'query2', 'query3'];
    const invalidQueries = [123, null, undefined];

    beforeEach(() => {
      recentQueriesList = buildRecentQueriesList(engine, {
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
