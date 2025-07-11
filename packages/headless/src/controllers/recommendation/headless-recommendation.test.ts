import {configuration} from '../../app/common-reducers.js';
import {updateNumberOfResults} from '../../features/pagination/pagination-actions.js';
import {
  getRecommendations,
  setRecommendationId,
} from '../../features/recommendation/recommendation-actions.js';
import {recommendationReducer} from '../../features/recommendation/recommendation-slice.js';
import {
  buildMockRecommendationEngine,
  type MockedRecommendationEngine,
} from '../../test/mock-engine-v2.js';
import {createMockRecommendationState} from '../../test/mock-recommendation-state.js';
import {
  buildRecommendationList,
  type RecommendationList,
} from './headless-recommendation.js';

vi.mock('../../features/recommendation/recommendation-actions');
vi.mock('../../features/pagination/pagination-actions');

describe('Recommendation', () => {
  let recommendation: RecommendationList;
  let engine: MockedRecommendationEngine;

  function initEngine(initialState = createMockRecommendationState()) {
    engine = buildMockRecommendationEngine(initialState);
  }

  beforeEach(() => {
    vi.resetAllMocks();
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
    const mockedSetRecommendationId = vi.mocked(setRecommendationId);

    recommendation = buildRecommendationList(engine, {options: {id: 'foo'}});

    expect(mockedSetRecommendationId).toHaveBeenCalledWith({id: 'foo'});
    expect(engine.dispatch).toHaveBeenCalledWith(
      mockedSetRecommendationId.mock.results[0].value
    );
  });

  it('when #options.id is set to an empty value, it does not dispatches #setRecommendationId', () => {
    const mockedSetRecommendationId = vi.mocked(setRecommendationId);

    recommendation = buildRecommendationList(engine, {options: {id: ''}});

    expect(mockedSetRecommendationId).not.toHaveBeenCalled();
  });

  it('when #options.numberOfRecommendations is set, it dispatches #updateNumberOfResults', () => {
    const mockedUpdateNumberOfResults = vi.mocked(updateNumberOfResults);

    recommendation = buildRecommendationList(engine, {
      options: {numberOfRecommendations: 20},
    });

    expect(mockedUpdateNumberOfResults).toHaveBeenCalledWith(20);
    expect(engine.dispatch).toHaveBeenCalledWith(
      mockedUpdateNumberOfResults.mock.results[0].value
    );
  });

  it('when #options.numberOfRecommendations is not set, it does not dispatches #updateNumberOfResults', () => {
    const mockedUpdateNumberOfResults = vi.mocked(updateNumberOfResults);

    recommendation = buildRecommendationList(engine);

    expect(mockedUpdateNumberOfResults).not.toHaveBeenCalled();
  });

  it('when #options.id is set to an invalid value, it throws an error', () => {
    const options = {id: 1 as unknown as string};
    const fn = () => buildRecommendationList(engine, {options});
    expect(fn).toThrow('Check the options of buildRecommendationList');
  });

  it('#refresh dispatches #getRecommendations', () => {
    const mockedGetRecommendations = vi.mocked(getRecommendations);

    recommendation.refresh();

    expect(mockedGetRecommendations).toHaveBeenCalled();
    expect(engine.dispatch).toHaveBeenCalledWith(
      mockedGetRecommendations.mock.results[0].value
    );
  });
});
