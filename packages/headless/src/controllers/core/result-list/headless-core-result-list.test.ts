import {SchemaValidationError} from '@coveo/bueno';
import {configuration} from '../../../app/common-reducers';
import {registerFieldsToInclude} from '../../../features/fields/fields-actions';
import {fieldsReducer as fields} from '../../../features/fields/fields-slice';
import {fetchMoreResults} from '../../../features/search/search-actions';
import {searchReducer as search} from '../../../features/search/search-slice';
import {
  buildMockSearchEngine,
  MockedSearchEngine,
} from '../../../test/mock-engine-v2';
import {buildMockResult} from '../../../test/mock-result';
import {createMockState} from '../../../test/mock-state';
import {buildCoreResultList, ResultList} from './headless-core-result-list';

jest.mock('../../../features/fields/fields-actions');
jest.mock('../../../features/search/search-actions');

describe('CoreResultList', () => {
  const testProps = {
    fetchMoreResultsActionCreator: fetchMoreResults,
  };
  let engine: MockedSearchEngine;

  beforeEach(() => {
    jest.resetAllMocks();
    const state = createMockState();
    const results = new Array(10).fill(buildMockResult());
    state.search.results = results;
    state.search.response.totalCountFiltered = 1000;
    engine = buildMockSearchEngine(state);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('it adds the correct reducers to engine', () => {
    buildCoreResultList(engine);
    expect(engine.addReducers).toHaveBeenCalledWith({
      configuration,
      search,
      fields,
    });
  });

  it('initializes correctly with no fields to include', () => {
    expect(buildCoreResultList(engine)).toBeTruthy();
    expect(registerFieldsToInclude).not.toHaveBeenCalled();
  });

  it('initializes correctly with fields to include', () => {
    buildCoreResultList(engine, {
      options: {fieldsToInclude: ['test']},
    });

    expect(registerFieldsToInclude).toHaveBeenCalledWith(['test']);
  });

  it('throws the correct error if the validation is not correct', () => {
    expect(() =>
      buildCoreResultList(engine, {
        options: {fieldsToInclude: [1 as unknown as string]},
      })
    ).toThrow(SchemaValidationError);
  });

  it('fetchMoreResults should dispatch a fetchMoreResults action', () => {
    buildCoreResultList(engine, testProps).fetchMoreResults();

    expect(fetchMoreResults).toHaveBeenCalled();
  });

  it('fetchMoreResults should not dispatch a fetchMoreResults action if search state is loading', () => {
    engine.state.search.isLoading = true;
    buildCoreResultList(engine, testProps).fetchMoreResults();
    expect(fetchMoreResults).not.toHaveBeenCalled();
  });

  it('moreResultsAvailable should return true when totalCountFiltered is greater than the results length', () => {
    expect(buildCoreResultList(engine).state.moreResultsAvailable).toBe(true);
  });

  it('moreResultsAvailable should return true when totalCountFiltered is lower or equal than the results length', () => {
    engine.state.search.response.totalCountFiltered =
      engine.state.search.results.length;
    expect(buildCoreResultList(engine).state.moreResultsAvailable).toBe(false);
  });

  describe('fetchMoreResults "infinite" fetches prevention', () => {
    let resultList: ResultList;
    let mockDispatch: jest.Mock;

    const fetchMoreResultsAndWait = async (
      iterations: number,
      delay: number
    ) => {
      for (let i = 0; i < iterations; i++) {
        resultList.fetchMoreResults();
        await Promise.resolve();
        jest.advanceTimersByTime(delay);
        await Promise.resolve();
      }
    };

    beforeEach(() => {
      mockDispatch = jest.fn().mockResolvedValue({});
      resultList = buildCoreResultList(
        {
          ...engine,
          dispatch: mockDispatch,
        },
        testProps
      );
      jest.spyOn(engine.logger, 'error');
      jest.spyOn(engine.logger, 'info');
    });

    it(`when calling fetchMoreResults consecutively many times with a small delay
  should log an error and prevent further dispatch`, async () => {
      await fetchMoreResultsAndWait(6, 100);

      expect(mockDispatch).toHaveBeenCalledTimes(5);
      expect(engine.logger.error).toHaveBeenCalledTimes(1);
    });

    it(`when calling fetchMoreResults consecutively a few times with a small delay
  should not log an error and allow further dispatches`, async () => {
      await fetchMoreResultsAndWait(3, 100);

      expect(mockDispatch).toHaveBeenCalledTimes(3);
      expect(engine.logger.error).not.toHaveBeenCalled();
    });

    it(`when calling fetchMoreResults consecutively many times with a longer delay
  should not log an error and allow further dispatches`, async () => {
      await fetchMoreResultsAndWait(6, 250);

      expect(mockDispatch).toHaveBeenCalledTimes(6);
      expect(engine.logger.error).not.toHaveBeenCalled();
    });

    it(`when calling fetchMoreResults while there are no more results available
    is should not dispatch and log an info`, async () => {
      engine.state.search.response.totalCountFiltered =
        engine.state.search.response.results.length;
      await fetchMoreResultsAndWait(1, 0);

      expect(mockDispatch).not.toHaveBeenCalled();
      expect(engine.logger.info).toHaveBeenCalledWith(
        'No more results are available for the result list to fetch.'
      );
    });
  });
});
