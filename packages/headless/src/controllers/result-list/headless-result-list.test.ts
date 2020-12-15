import {buildResultList, ResultList} from './headless-result-list';
import {buildMockSearchAppEngine, MockEngine} from '../../test/mock-engine';
import {SearchAppState} from '../../state/search-app-state';
import {registerFieldsToInclude} from '../../features/fields/fields-actions';
import {SchemaValidationError} from '@coveo/bueno';
import {fetchMoreResults} from '../../features/search/search-actions';

describe('ResultList', () => {
  let engine: MockEngine<SearchAppState>;

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
  });

  it('initializes correctly with no fields to include', () => {
    expect(buildResultList(engine)).toBeTruthy();
    const action = engine.actions.find(
      (a) => a.type === registerFieldsToInclude.type
    );
    expect(action).toBeUndefined();
  });

  it('initializes correctly with fields to include', () => {
    expect(
      buildResultList(engine, {
        options: {fieldsToInclude: ['test']},
      })
    ).toBeTruthy();
    expect(engine.actions).toContainEqual(registerFieldsToInclude(['test']));
  });

  it('throws the correct error if the validation is not correct', () => {
    expect(() =>
      buildResultList(engine, {
        options: {fieldsToInclude: [(1 as unknown) as string]},
      })
    ).toThrowError(SchemaValidationError);
  });

  it('fetchMoreResults should dispatch a fetchMoreResults action', () => {
    buildResultList(engine).fetchMoreResults();
    expect(
      engine.actions.find(
        (action) => action.type === fetchMoreResults.pending.type
      )
    ).toBeTruthy();
  });

  it('fetchMoreResults should not dispatch a fetchMoreResults action if search state is loading', () => {
    engine.state.search.isLoading = true;
    buildResultList(engine).fetchMoreResults();
    expect(
      engine.actions.find(
        (action) => action.type === fetchMoreResults.pending.type
      )
    ).toBeFalsy();
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
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    };

    beforeEach(() => {
      mockDispatch = jest.fn().mockResolvedValue({});
      resultList = buildResultList({
        ...engine,
        dispatch: mockDispatch,
      });
      spyOn(engine.logger, 'error');
    });

    it(`when calling fetchMoreResults consecutively many times with a small delay
  should log an error and prevent further dispatch`, async (done) => {
      await fetchMoreResultsAndWait(6, 100);

      expect(mockDispatch).toHaveBeenCalledTimes(5);
      expect(engine.logger.error).toHaveBeenCalledTimes(1);
      done();
    });

    it(`when calling fetchMoreResults consecutively a few times with a small delay
  should not log an error and allow further dispatches`, async (done) => {
      await fetchMoreResultsAndWait(3, 100);

      expect(mockDispatch).toHaveBeenCalledTimes(3);
      expect(engine.logger.error).not.toHaveBeenCalled();
      done();
    });

    it(`when calling fetchMoreResults consecutively many times with a longer delay
  should not log an error and allow further dispatches`, async (done) => {
      await fetchMoreResultsAndWait(6, 250);

      expect(mockDispatch).toHaveBeenCalledTimes(6);
      expect(engine.logger.error).not.toHaveBeenCalled();
      done();
    });
  });
});
