import {
  buildInsightResultList,
  InsightResultList,
} from './headless-insight-result-list';
import {
  buildMockInsightEngine,
  MockInsightEngine,
} from '../../../test/mock-engine';
import {registerFieldsToInclude} from '../../../features/fields/fields-actions';
import {SchemaValidationError} from '@coveo/bueno';
import {buildMockResult} from '../../../test';
import {configuration, fields, search} from '../../../app/reducers';
import {insightFetchMoreResults} from '../../../features/insight-search/insight-search-actions';

describe('InsightResultList', () => {
  let engine: MockInsightEngine;

  beforeEach(() => {
    engine = buildMockInsightEngine();
    const results = new Array(10).fill(buildMockResult());
    engine.state.search.results = results;
    engine.state.search.response.totalCountFiltered = 1000;
    jest.useFakeTimers('modern');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('it adds the correct reducers to engine', () => {
    buildInsightResultList(engine);
    expect(engine.addReducers).toHaveBeenCalledWith({
      configuration,
      search,
      fields,
    });
  });

  it('initializes correctly with no fields to include', () => {
    expect(buildInsightResultList(engine)).toBeTruthy();
    const action = engine.actions.find(
      (a) => a.type === registerFieldsToInclude.type
    );
    expect(action).toBeUndefined();
  });

  it('initializes correctly with fields to include', () => {
    expect(
      buildInsightResultList(engine, {
        options: {fieldsToInclude: ['test']},
      })
    ).toBeTruthy();
    expect(engine.actions).toContainEqual(registerFieldsToInclude(['test']));
  });

  it('throws the correct error if the validation is not correct', () => {
    expect(() =>
      buildInsightResultList(engine, {
        options: {fieldsToInclude: [1 as unknown as string]},
      })
    ).toThrowError(SchemaValidationError);
  });

  it('fetchMoreResults should dispatch an insightFetchMoreResults action', () => {
    buildInsightResultList(engine).fetchMoreResults();
    expect(
      engine.actions.find(
        (action) => action.type === insightFetchMoreResults.pending.type
      )
    ).toBeTruthy();
  });

  it('fetchMoreResults should not dispatch an insightFetchMoreResults action if search state is loading', () => {
    engine.state.search.isLoading = true;
    buildInsightResultList(engine).fetchMoreResults();
    expect(
      engine.actions.find(
        (action) => action.type === insightFetchMoreResults.pending.type
      )
    ).toBeFalsy();
  });

  it('moreResultsAvailable should return true when totalCountFiltered is greater than the results length', () => {
    expect(buildInsightResultList(engine).state.moreResultsAvailable).toBe(
      true
    );
  });

  it('moreResultsAvailable should return true when totalCountFiltered is lower or equal than the results length', () => {
    engine.state.search.response.totalCountFiltered =
      engine.state.search.results.length;
    expect(buildInsightResultList(engine).state.moreResultsAvailable).toBe(
      false
    );
  });

  describe('fetchMoreResults "infinite" fetches prevention', () => {
    let resultList: InsightResultList;
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
      resultList = buildInsightResultList({
        ...engine,
        dispatch: mockDispatch,
      });
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
