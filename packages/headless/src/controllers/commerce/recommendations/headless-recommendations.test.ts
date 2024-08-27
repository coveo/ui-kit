import {ChildProduct} from '../../../api/commerce/common/product';
import {
  fetchRecommendations,
  promoteChildToParent,
} from '../../../features/commerce/recommendations/recommendations-actions';
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
    });
  });

  it('#promoteChildToParent dispatches #promoteChildToParent with the correct arguments', () => {
    const child = {permanentid: 'childPermanentId'} as ChildProduct;

    recommendations.promoteChildToParent(child);

    expect(promoteChildToParent).toHaveBeenCalledWith({
      child,
      slotId: 'slot-id',
    });
  });

  it('refresh dispatches #fetchRecommendations', () => {
    recommendations.refresh();
    expect(fetchRecommendations).toHaveBeenCalled();
  });
});
