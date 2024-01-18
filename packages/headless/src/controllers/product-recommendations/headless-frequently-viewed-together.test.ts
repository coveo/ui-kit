import {
  buildMockProductRecommendationEngine,
  MockedProductRecommendationEngine,
} from '../../test/mock-engine-v2';
import {buildMockProductRecommendationsState} from '../../test/mock-product-recommendations-state';
import {buildBaseProductRecommendationsList} from './headless-base-product-recommendations';
import {
  buildFrequentlyViewedTogetherList,
  FrequentlyViewedTogetherListOptions,
} from './headless-frequently-viewed-together';

jest.mock('./headless-base-product-recommendations');

describe('headless frequently-viewed-together', () => {
  let mockedBaseProductRecommendationsList: jest.Mock;
  let engine: MockedProductRecommendationEngine;

  const baseOptions: Partial<FrequentlyViewedTogetherListOptions> = {
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
    buildFrequentlyViewedTogetherList(engine, {
      options: baseOptions,
    });
  });

  it('builds a baseProductRecommendationsList with the good params', () => {
    expect(mockedBaseProductRecommendationsList).toHaveBeenCalledWith(engine, {
      options: {
        ...baseOptions,
        id: 'frequentViewed',
      },
    });
  });
});
