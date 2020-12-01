import {
  buildMockRecommendationAppEngine,
  MockEngine,
} from '../../test/mock-engine';
import {RecommendationAppState} from '../../state/recommendation-app-state';
import {
  buildRecommendationList,
  RecommendationList,
} from './headless-recommendation';
import {createMockRecommendationState} from '../../test/mock-recommendation-state';
import {Action} from 'redux';
import {
  getRecommendations,
  setRecommendationId,
} from '../../features/recommendation/recommendation-actions';

describe('headless recommendation', () => {
  let state: RecommendationAppState;
  let recommendation: RecommendationList;
  let engine: MockEngine<RecommendationAppState>;

  beforeEach(() => {
    state = createMockRecommendationState();
    engine = buildMockRecommendationAppEngine({state});
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

  it('when #options.id is set to a non empty value, it dispatches #setRecommendationId', () => {
    recommendation = buildRecommendationList(engine, {options: {id: 'foo'}});
    expectContainAction(setRecommendationId);
  });

  it('when #options.id is set to an empty value, it does not dispatches #setRecommendationId', () => {
    recommendation = buildRecommendationList(engine, {options: {id: ''}});
    expectDoesNotContainAction(setRecommendationId);
  });

  it('when #options.id is set to an invalid value, it throws an error', () => {
    const options = {id: (1 as unknown) as string};
    const fn = () => buildRecommendationList(engine, {options});
    expect(fn).toThrow('Check the options of buildRecommendationList');
  });

  it('getRecommendations dispatches #getRecommendations', () => {
    recommendation.refresh();
    expectContainAction(getRecommendations.pending);
  });
});
