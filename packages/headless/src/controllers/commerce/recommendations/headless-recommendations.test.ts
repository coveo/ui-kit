import {configuration} from '../../../app/common-reducers';
import {contextReducer} from '../../../features/commerce/context/context-slice';
import {fetchRecommendations} from '../../../features/commerce/recommendations/recommendations-actions';
import {recommendationsReducer} from '../../../features/commerce/recommendations/recommendations-slice';
import {buildMockCommerceState} from '../../../test/mock-commerce-state';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../test/mock-engine-v2';
import {
  Recommendations,
  buildRecommendations,
} from './headless-recommendations';

jest.mock('../../../features/commerce/recommendations/recommendations-actions');

describe('headless recommendations', () => {
  let recommendations: Recommendations;
  let engine: MockedCommerceEngine;

  beforeEach(() => {
    engine = buildMockCommerceEngine(buildMockCommerceState());
    recommendations = buildRecommendations(engine, {
      options: {slotId: 'slot-id'},
    });
  });

  it('adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      recommendations: recommendationsReducer,
      commerceContext: contextReducer,
      configuration,
    });
  });

  it('refresh dispatches #fetchRecommendations', () => {
    recommendations.refresh();
    expect(fetchRecommendations).toHaveBeenCalled();
  });
});
