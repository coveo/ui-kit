import {configuration} from '../../../app/common-reducers';
import {contextReducer} from '../../../features/commerce/context/context-slice';
import {fetchRecommendation} from '../../../features/commerce/recommendation/recommendation-actions';
import {recommendationV2Reducer} from '../../../features/commerce/recommendation/recommendation-slice';
import {buildMockCommerceState} from '../../../test/mock-commerce-state';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../test/mock-engine-v2';
import {Recommendation, buildRecommendations} from './headless-recommendations';

jest.mock('../../../features/commerce/recommendation/recommendation-actions');

describe('headless recommendations', () => {
  let recommendations: Recommendation;
  let engine: MockedCommerceEngine;

  beforeEach(() => {
    engine = buildMockCommerceEngine(buildMockCommerceState());
    recommendations = buildRecommendations('slot-id', engine);
  });

  it('adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      recommendation: recommendationV2Reducer,
      commerceContext: contextReducer,
      configuration,
    });
  });

  it('refresh dispatches #fetchRecommendations', () => {
    recommendations.refresh();
    expect(fetchRecommendation).toHaveBeenCalled();
  });
});
