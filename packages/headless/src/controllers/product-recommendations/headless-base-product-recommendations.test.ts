import {configuration} from '../../app/common-reducers';
import {
  getProductRecommendations,
  setProductRecommendationsAdditionalFields,
  setProductRecommendationsMaxNumberOfRecommendations,
  setProductRecommendationsRecommenderId,
  setProductRecommendationsSkus,
} from '../../features/product-recommendations/product-recommendations-actions';
import {productRecommendationsReducer} from '../../features/product-recommendations/product-recommendations-slice';
import {
  buildMockProductRecommendationEngine,
  MockedProductRecommendationEngine,
} from '../../test/mock-engine-v2';
import {buildMockProductRecommendationsState} from '../../test/mock-product-recommendations-state';
import {
  buildBaseProductRecommendationsList,
  ProductRecommendationsList,
  ProductRecommendationsListOptions,
} from './headless-base-product-recommendations';

jest.mock(
  '../../features/product-recommendations/product-recommendations-actions'
);

describe('headless product-recommendations', () => {
  let productRecommendations: ProductRecommendationsList;
  let engine: MockedProductRecommendationEngine;

  const baseOptions: Partial<ProductRecommendationsListOptions> = {
    id: 'bloup',
  };

  function initEngine(initialState = buildMockProductRecommendationsState()) {
    engine = buildMockProductRecommendationEngine(initialState);
  }

  beforeEach(() => {
    jest.resetAllMocks();
    initEngine();
    productRecommendations = buildBaseProductRecommendationsList(engine, {
      options: baseOptions,
    });
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      productRecommendations: productRecommendationsReducer,
      configuration,
    });
  });

  it('it dispatches #setProductRecommendationsRecommenderId', () => {
    const mockedSetProductRecommendationsRecommenderId = jest.mocked(
      setProductRecommendationsRecommenderId
    );

    expect(mockedSetProductRecommendationsRecommenderId).toHaveBeenCalledWith({
      id: 'bloup',
    });
    expect(engine.dispatch).toHaveBeenCalledWith(
      mockedSetProductRecommendationsRecommenderId.mock.results[0].value
    );
  });

  it('when options.maxNumberOfRecommendations is set to a non empty value, it dispatches #setProductRecommendationsMaxNumberOfRecommendations', () => {
    const mockedSetProductRecommendationsMaxNumberOfRecommendations =
      jest.mocked(setProductRecommendationsMaxNumberOfRecommendations);

    productRecommendations = buildBaseProductRecommendationsList(engine, {
      options: {...baseOptions, maxNumberOfRecommendations: 10},
    });

    expect(
      mockedSetProductRecommendationsMaxNumberOfRecommendations
    ).toHaveBeenCalledWith({
      number: 10,
    });
    expect(engine.dispatch).toHaveBeenCalledWith(
      mockedSetProductRecommendationsMaxNumberOfRecommendations.mock.results[0]
        .value
    );
  });

  it('when options.additionalFields is set to a non empty value, it dispatches #setProductRecommendationsAdditionalFields', () => {
    const mockedSetProductRecommendationsAdditionalFields = jest.mocked(
      setProductRecommendationsAdditionalFields
    );
    productRecommendations = buildBaseProductRecommendationsList(engine, {
      options: {...baseOptions, additionalFields: ['bloup']},
    });
    expect(
      mockedSetProductRecommendationsAdditionalFields
    ).toHaveBeenCalledWith({
      additionalFields: ['bloup'],
    });
    expect(engine.dispatch).toHaveBeenCalledWith(
      mockedSetProductRecommendationsAdditionalFields.mock.results[0].value
    );
  });

  it('when options.skus is set, it dispatches #setProductRecommendationsSkus', () => {
    const mockedSetProductRecommendationsSkus = jest.mocked(
      setProductRecommendationsSkus
    );

    productRecommendations = buildBaseProductRecommendationsList(engine, {
      options: {...baseOptions, skus: ['bloup']},
    });

    expect(mockedSetProductRecommendationsSkus).toHaveBeenCalledWith({
      skus: ['bloup'],
    });
    expect(engine.dispatch).toHaveBeenCalledWith(
      mockedSetProductRecommendationsSkus.mock.results[0].value
    );
  });

  it('when options.maxNumberOfRecommendations is set to a low value, it throws a schema validation error', () => {
    expect(() =>
      buildBaseProductRecommendationsList(engine, {
        options: {...baseOptions, maxNumberOfRecommendations: 0},
      })
    ).toThrow();
  });

  it('when options.maxNumberOfRecommendations is set to a value higher than 50, it throws a schema validation error', () => {
    expect(() =>
      buildBaseProductRecommendationsList(engine, {
        options: {...baseOptions, maxNumberOfRecommendations: 120},
      })
    ).toThrow();
  });

  it('when options.skus is not set, it does not dispatch #setProductRecommendationsSkus', () => {
    const mockedSetProductRecommendationsSkus = jest.mocked(
      setProductRecommendationsSkus
    );
    productRecommendations = buildBaseProductRecommendationsList(engine, {
      options: {...baseOptions},
    });
    expect(mockedSetProductRecommendationsSkus).not.toHaveBeenCalled();
  });

  it('#setSkus dispatches #setProductRecommendationsSkus', () => {
    const mockedSetProductRecommendationsSkus = jest.mocked(
      setProductRecommendationsSkus
    );
    productRecommendations.setSkus(['bloup']);
    expect(mockedSetProductRecommendationsSkus).toHaveBeenCalledWith({
      skus: ['bloup'],
    });
    expect(engine.dispatch).toHaveBeenCalledWith(
      mockedSetProductRecommendationsSkus.mock.results[0].value
    );
  });

  it('#refresh dispatches #updateProductRecommendations', () => {
    const mockedUpdateProductRecommendations = jest.mocked(
      getProductRecommendations
    );
    productRecommendations.refresh();

    expect(mockedUpdateProductRecommendations).toHaveBeenCalled();
    expect(engine.dispatch).toHaveBeenCalledWith(
      mockedUpdateProductRecommendations.mock.results[0].value
    );
  });
});
