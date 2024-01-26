import {
  buildMockProductRecommendationEngine,
  MockedProductRecommendationEngine,
} from '../../test/mock-engine-v2';
import {buildMockProductRecommendationsState} from '../../test/mock-product-recommendations-state';
import {
  buildBaseProductRecommendationsList,
  ProductRecommendationsListState,
} from './headless-base-product-recommendations';
import {
  buildPopularViewedRecommendationsList,
  PopularViewedRecommendationsList,
} from './headless-popular-viewed-recommendations';

jest.mock('./headless-base-product-recommendations');

describe('headless popular-bought-recommendations', () => {
  let mockedBaseProductRecommendationsList: jest.Mock;
  let popularViewed: PopularViewedRecommendationsList;
  let engine: MockedProductRecommendationEngine;
  let state: Partial<ProductRecommendationsListState>;

  const baseOptions: Partial<ProductRecommendationsListState> = {
    skus: ['some-sku'],
  };

  function initEngine(initialState = buildMockProductRecommendationsState()) {
    engine = buildMockProductRecommendationEngine(initialState);
  }

  beforeEach(() => {
    jest.resetAllMocks();
    state = {skus: []};
    mockedBaseProductRecommendationsList = jest
      .mocked(buildBaseProductRecommendationsList)
      .mockImplementation(
        () =>
          ({
            setSkus: jest.fn(),
            refresh: jest.fn(),
            state,
          }) as unknown as ReturnType<
            typeof buildBaseProductRecommendationsList
          >
      );
    initEngine();
    popularViewed = buildPopularViewedRecommendationsList(engine, {
      options: baseOptions,
    });
  });

  it('builds a baseProductRecommendationsList with the good params', () => {
    expect(mockedBaseProductRecommendationsList).toHaveBeenCalledWith(engine, {
      options: {
        ...baseOptions,
        id: 'popularViewed',
      },
    });
  });

  it('state is a spread of baseProductRecommendationsList state + sku being the first skus - skus', () => {
    state = {
      skus: ['sku1', 'sku2'],
      isLoading: false,
    };
    popularViewed = buildPopularViewedRecommendationsList(engine, {
      options: baseOptions,
    });

    expect(popularViewed.state).toEqual({
      isLoading: false,
    });
  });

  it("it doesn't exposes the #setSkus function from the baseProductRecommendationsList", () => {
    expect(popularViewed).not.toHaveProperty('setSkus');
  });
});
