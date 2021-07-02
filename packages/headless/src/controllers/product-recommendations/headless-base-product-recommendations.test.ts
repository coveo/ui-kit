import {
  buildMockProductRecommendationsAppEngine,
  MockProductRecommendationEngine,
} from '../../test/mock-engine';
import {
  buildBaseProductRecommendationsList,
  ProductRecommendationsList,
  ProductRecommendationsListOptions,
} from './headless-base-product-recommendations';
import {Action} from 'redux';
import {
  getProductRecommendations,
  setProductRecommendationsAdditionalFields,
  setProductRecommendationsMaxNumberOfRecommendations,
  setProductRecommendationsRecommenderId,
  setProductRecommendationsSkus,
} from '../../features/product-recommendations/product-recommendations-actions';
import {configuration} from '../../app/reducers';
import {productRecommendationsReducer} from '../../features/product-recommendations/product-recommendations-slice';

describe('headless product-recommendations', () => {
  let productRecommendations: ProductRecommendationsList;
  let engine: MockProductRecommendationEngine;

  const baseOptions: Partial<ProductRecommendationsListOptions> = {
    id: 'bloup',
  };

  beforeEach(() => {
    engine = buildMockProductRecommendationsAppEngine();
    productRecommendations = buildBaseProductRecommendationsList(engine, {
      options: baseOptions,
    });
  });

  const expectContainAction = (action: Action) => {
    const found = engine.actions.find((a) => a.type === action.type);
    expect(engine.actions).toContainEqual(found);
  };

  const expectDoesNotContainAction = (action: Action) => {
    const found = engine.actions.find((a) => a.type === action.type);
    expect(engine.actions).not.toContainEqual(found);
  };

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      productRecommendations: productRecommendationsReducer,
      configuration,
    });
  });

  it('when options.id is set to a non empty value, it dispatches #setProductRecommendationsRecommenderId', () => {
    productRecommendations = buildBaseProductRecommendationsList(engine, {
      options: {...baseOptions, id: 'someid'},
    });
    expectContainAction(setProductRecommendationsRecommenderId);
  });

  it('when options.maxNumberOfRecommendations is set to a non empty value, it dispatches #setProductRecommendationsMaxNumberOfRecommendations', () => {
    productRecommendations = buildBaseProductRecommendationsList(engine, {
      options: {...baseOptions, maxNumberOfRecommendations: 10},
    });
    expectContainAction(setProductRecommendationsMaxNumberOfRecommendations);
  });

  it('when options.additionalFields is set to a non empty value, it dispatches #setProductRecommendationsAdditionalFields', () => {
    productRecommendations = buildBaseProductRecommendationsList(engine, {
      options: {...baseOptions, additionalFields: ['bloup']},
    });
    expectContainAction(setProductRecommendationsAdditionalFields);
  });

  it('when options.skus is set to a one item array, it dispatches #setProductRecommendationsSkus', () => {
    productRecommendations = buildBaseProductRecommendationsList(engine, {
      options: {...baseOptions, skus: ['bloup']},
    });
    expectContainAction(setProductRecommendationsSkus);
  });

  it('when options.maxNumberOfRecommendations is set to a low value, it throws a schema validation error', () => {
    expect(() =>
      buildBaseProductRecommendationsList(engine, {
        options: {...baseOptions, maxNumberOfRecommendations: 0},
      })
    ).toThrowError();
  });

  it('when options.maxNumberOfRecommendations is set to a value higher than 50, it throws a schema validation error', () => {
    expect(() =>
      buildBaseProductRecommendationsList(engine, {
        options: {...baseOptions, maxNumberOfRecommendations: 120},
      })
    ).toThrowError();
  });

  it('when options.skus is not set, it does not dispatch #setProductRecommendationsSkus', () => {
    productRecommendations = buildBaseProductRecommendationsList(engine, {
      options: {...baseOptions},
    });
    expectDoesNotContainAction(setProductRecommendationsSkus);
  });

  it('setSkus dispatches #setProductRecommendationsSkus', () => {
    productRecommendations.setSkus(['bloup']);
    expectContainAction(setProductRecommendationsSkus);
  });

  it('refresh dispatches #updateProductRecommendations', () => {
    productRecommendations.refresh();
    expectContainAction(getProductRecommendations.pending);
  });
});
