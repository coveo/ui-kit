import {
  buildMockProductRecommendationEngine,
  MockedProductRecommendationEngine,
} from '../../test/mock-engine-v2';
import {buildMockProductRecommendationsState} from '../../test/mock-product-recommendations-state';
import {buildBaseProductRecommendationsList} from './headless-base-product-recommendations';
import {
  buildFrequentlyViewedDifferentCategoryList,
  FrequentlyViewedDifferentCategoryListOptions,
} from './headless-frequently-viewed-different-category';

jest.mock('./headless-base-product-recommendations');

describe('headless frequently-viewed-together', () => {
  let mockedBaseProductRecommendationsList: jest.Mock;
  let engine: MockedProductRecommendationEngine;

  const baseOptions: Partial<FrequentlyViewedDifferentCategoryListOptions> = {
    skus: ['some-sku'],
  };

  function initEngine(initialState = buildMockProductRecommendationsState()) {
    engine = buildMockProductRecommendationEngine(initialState);
  }

  beforeEach(() => {
    jest.resetAllMocks();
    mockedBaseProductRecommendationsList = jest.mocked(
      buildBaseProductRecommendationsList
    );
    initEngine();
    buildFrequentlyViewedDifferentCategoryList(engine, {
      options: baseOptions,
    });
  });

  it('builds a baseProductRecommendationsList with the good params', () => {
    expect(mockedBaseProductRecommendationsList).toHaveBeenCalledWith(engine, {
      options: {
        ...baseOptions,
        id: 'frequentViewedDifferentCategory',
      },
    });
  });
});
