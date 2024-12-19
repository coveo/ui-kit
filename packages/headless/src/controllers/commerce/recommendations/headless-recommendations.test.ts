import {ChildProduct} from '../../../api/commerce/common/product.js';
import {
  fetchRecommendations,
  promoteChildToParent,
  registerRecommendationsSlot,
} from '../../../features/commerce/recommendations/recommendations-actions.js';
import {recommendationsReducer} from '../../../features/commerce/recommendations/recommendations-slice.js';
import {buildMockCommerceState} from '../../../test/mock-commerce-state.js';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../test/mock-engine-v2.js';
import {
  Recommendations,
  buildRecommendations,
} from './headless-recommendations.js';

vi.mock('../../../features/commerce/recommendations/recommendations-actions');

describe('headless recommendations', () => {
  let recommendations: Recommendations;
  let engine: MockedCommerceEngine;

  beforeEach(() => {
    engine = buildMockCommerceEngine(buildMockCommerceState());
    recommendations = buildRecommendations(engine, {
      options: {slotId: 'slot-id', productId: 'product-id'},
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

  it('dispatches #registerRecommendationsSlot with the correct arguments', () => {
    expect(registerRecommendationsSlot).toHaveBeenCalledWith({
      slotId: 'slot-id',
      productId: 'product-id',
    });
  });
});
