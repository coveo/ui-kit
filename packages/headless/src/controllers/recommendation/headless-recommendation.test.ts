import {configuration} from '../../app/common-reducers';
import {updateNumberOfResults} from '../../features/pagination/pagination-actions';
import {
  getRecommendations,
  setRecommendationId,
} from '../../features/recommendation/recommendation-actions';
import {recommendationReducer} from '../../features/recommendation/recommendation-slice';
import {
  buildMockRecommendationEngine,
  MockedRecommendationEngine,
} from '../../test/mock-engine-v2';
import {createMockRecommendationState} from '../../test/mock-recommendation-state';
import {
  buildRecommendationList,
  RecommendationList,
} from './headless-recommendation';

jest.mock('../../features/recommendation/recommendation-actions');
jest.mock('../../features/pagination/pagination-actions');

describe('Recommendation', () => {
  let recommendation: RecommendationList;
  let engine: MockedRecommendationEngine;

  function initEngine(initialState = createMockRecommendationState()) {
    engine = buildMockRecommendationEngine(initialState);
  }

  beforeEach(() => {
    jest.resetAllMocks();
    initEngine();
    recommendation = buildRecommendationList(engine);
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      configuration,
      recommendation: recommendationReducer,
    });
  });

  it('when #options.id is set to a non empty value, it dispatches #setRecommendationId', () => {
    const mockedSetRecommendationId = jest.mocked(setRecommendationId);

    recommendation = buildRecommendationList(engine, {options: {id: 'foo'}});

    expect(mockedSetRecommendationId).toHaveBeenCalledWith({id: 'foo'});
    expect(engine.dispatch).toHaveBeenCalledWith(
      mockedSetRecommendationId.mock.results[0].value
    );
  });

  it('when #options.id is set to an empty value, it does not dispatches #setRecommendationId', () => {
    const mockedSetRecommendationId = jest.mocked(setRecommendationId);

    recommendation = buildRecommendationList(engine, {options: {id: ''}});

    expect(mockedSetRecommendationId).not.toHaveBeenCalled();
  });

  it('when #options.numberOfRecommendations is set, it dispatches #updateNumberOfResults', () => {
    const mockedUpdateNumberOfResults = jest.mocked(updateNumberOfResults);

    recommendation = buildRecommendationList(engine, {
      options: {numberOfRecommendations: 20},
    });

    expect(mockedUpdateNumberOfResults).toHaveBeenCalledWith(20);
    expect(engine.dispatch).toHaveBeenCalledWith(
      mockedUpdateNumberOfResults.mock.results[0].value
    );
  });

  it('when #options.numberOfRecommendations is not set, it does not dispatches #updateNumberOfResults', () => {
    const mockedUpdateNumberOfResults = jest.mocked(updateNumberOfResults);

    recommendation = buildRecommendationList(engine);

    expect(mockedUpdateNumberOfResults).not.toHaveBeenCalled();
  });

  it('when #options.id is set to an invalid value, it throws an error', () => {
    const options = {id: 1 as unknown as string};
    const fn = () => buildRecommendationList(engine, {options});
    expect(fn).toThrow('Check the options of buildRecommendationList');
  });

  it('#refresh dispatches #getRecommendations', () => {
    const mockedGetRecommendations = jest.mocked(getRecommendations);

    recommendation.refresh();

    expect(mockedGetRecommendations).toHaveBeenCalled();
    expect(engine.dispatch).toHaveBeenCalledWith(
      mockedGetRecommendations.mock.results[0].value
    );
  });
});
