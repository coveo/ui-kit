import {
  buildMockProductRecommendationEngine,
  MockedProductRecommendationEngine,
} from '../../test/mock-engine-v2';
import {buildMockProductRecommendationsState} from '../../test/mock-product-recommendations-state';
import {buildBaseProductRecommendationsList} from './headless-base-product-recommendations';
import {
  buildCartRecommendationsList,
  CartRecommendationsList,
} from './headless-cart-recommendations';

jest.mock('./headless-base-product-recommendations');

describe('headless cart-recommendations', () => {
  let cartRecommender: CartRecommendationsList;
  let engine: MockedProductRecommendationEngine;
  let mockedBaseProductRecommendationsList: jest.Mock;

  function initEngine(initialState = buildMockProductRecommendationsState()) {
    engine = buildMockProductRecommendationEngine(initialState);
  }

  beforeEach(() => {
    jest.resetAllMocks();
    mockedBaseProductRecommendationsList = jest.mocked(
      buildBaseProductRecommendationsList
    );
    initEngine();
    cartRecommender = buildCartRecommendationsList(engine, {
      options: {
        skus: ['sku1', 'sku2'],
      },
    });
  });

  it('builds a baseProductRecommendationsList with the good params and returns it', () => {
    expect(mockedBaseProductRecommendationsList).toHaveBeenCalledWith(engine, {
      options: {
        id: 'cart',
        skus: ['sku1', 'sku2'],
      },
    });
    expect(cartRecommender).toBe(
      mockedBaseProductRecommendationsList.mock.results[0].value
    );
  });
});
