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
  buildFrequentlyBoughtTogetherList,
  FrequentlyBoughtTogetherList,
  FrequentlyBoughtTogetherListOptions,
} from './headless-frequently-bought-together';

jest.mock('./headless-base-product-recommendations');

describe('headless frequently-bought-together', () => {
  let frequentlyBoughtTogether: FrequentlyBoughtTogetherList;
  let engine: MockedProductRecommendationEngine;
  let mockedBaseProductRecommendationsList: jest.Mock;
  let state: Partial<ProductRecommendationsListState>;
  const baseOptions: FrequentlyBoughtTogetherListOptions = {
    sku: 'some-sku',
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
    frequentlyBoughtTogether = buildFrequentlyBoughtTogetherList(engine, {
      options: baseOptions,
    });
  });

  it('builds a baseProductRecommendationsList with the good params', () => {
    expect(mockedBaseProductRecommendationsList).toHaveBeenCalledWith(engine, {
      options: {
        id: 'frequentBought',
        skus: ['some-sku'],
      },
    });
  });

  it('state is a spread of baseProductRecommendationsList state + sku being the first skus - skus', () => {
    state = {
      skus: ['sku1', 'sku2'],
      isLoading: false,
    };

    frequentlyBoughtTogether = buildFrequentlyBoughtTogetherList(engine, {
      options: baseOptions,
    });

    expect(frequentlyBoughtTogether.state).toEqual({
      sku: 'sku1',
      isLoading: false,
    });
  });

  it('#setSku calls baseProductRecommendationsList.setSkus with the good params', () => {
    frequentlyBoughtTogether.setSku('new-sku');
    expect(
      mockedBaseProductRecommendationsList.mock.results[0].value.setSkus
    ).toHaveBeenCalledWith(['new-sku']);
  });
});
