import {Action} from '@reduxjs/toolkit';
import {configuration} from '../../app/common-reducers';
import {updateNumberOfResults} from '../../features/pagination/pagination-actions';
import {
  getRecommendations,
  setRecommendationId,
} from '../../features/recommendation/recommendation-actions';
import {recommendationReducer} from '../../features/recommendation/recommendation-slice';
import {
  buildMockRecommendationAppEngine,
  MockRecommendationEngine,
} from '../../test/mock-engine';
import {
  buildRecommendationList,
  RecommendationList,
} from './headless-recommendation';

describe('headless recommendation', () => {
  let recommendation: RecommendationList;
  let engine: MockRecommendationEngine;

  beforeEach(() => {
    engine = buildMockRecommendationAppEngine();
    recommendation = buildRecommendationList(engine);
  });

  const expectContainAction = (action: Action) => {
    const found = engine.actions.find((a) => a.type === action.type);
    expect(engine.actions).toContainEqual(found);
  };

  const expectDoesNotContainAction = (action: Action) => {
    const found = engine.actions.find((a) => a.type === action.type);
    expect(engine.actions).not.toContainEqual(found);
  };

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      configuration,
      recommendation: recommendationReducer,
    });
  });

  it('when #options.id is set to a non empty value, it dispatches #setRecommendationId', () => {
    recommendation = buildRecommendationList(engine, {options: {id: 'foo'}});
    expectContainAction(setRecommendationId);
  });

  it('when #options.id is set to an empty value, it does not dispatches #setRecommendationId', () => {
    recommendation = buildRecommendationList(engine, {options: {id: ''}});
    expectDoesNotContainAction(setRecommendationId);
  });

  it('when #options.numberOfRecommendations is set, it dispatches #updateNumberOfResults', () => {
    recommendation = buildRecommendationList(engine, {
      options: {numberOfRecommendations: 20},
    });
    expectContainAction(updateNumberOfResults);
  });

  it('when #options.numberOfRecommendations is not set, it does not dispatches #updateNumberOfResults', () => {
    recommendation = buildRecommendationList(engine);
    expectDoesNotContainAction(setRecommendationId);
  });

  it('when #options.id is set to an invalid value, it throws an error', () => {
    const options = {id: 1 as unknown as string};
    const fn = () => buildRecommendationList(engine, {options});
    expect(fn).toThrow('Check the options of buildRecommendationList');
  });

  it('getRecommendations dispatches #getRecommendations', () => {
    recommendation.refresh();
    expectContainAction(getRecommendations.pending);
  });
});
