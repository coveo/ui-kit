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
  buildPopularBoughtRecommendationsList,
  PopularBoughtRecommendationsList,
} from './headless-popular-bought-recommendations';

jest.mock('./headless-base-product-recommendations');

describe('headless popular-bought-recommendations', () => {
  let mockedBaseProductRecommendationsList: jest.Mock;
  let popularBought: PopularBoughtRecommendationsList;
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
    popularBought = buildPopularBoughtRecommendationsList(engine, {
      options: baseOptions,
    });
  });

  it('builds a baseProductRecommendationsList with the good params', () => {
    expect(mockedBaseProductRecommendationsList).toHaveBeenCalledWith(engine, {
      options: {
        ...baseOptions,
        id: 'popularBought',
      },
    });
  });

  it('state is a spread of baseProductRecommendationsList state + sku being the first skus - skus', () => {
    state = {
      skus: ['sku1', 'sku2'],
      isLoading: false,
    };
    popularBought = buildPopularBoughtRecommendationsList(engine, {
      options: baseOptions,
    });

    expect(popularBought.state).toEqual({
      isLoading: false,
    });
  });

  it("it doesn't exposes the #setSkus function from the baseProductRecommendationsList", () => {
    expect(popularBought).not.toHaveProperty('setSkus');
  });
});
