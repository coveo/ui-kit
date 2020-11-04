import {
  buildMockProductRecommendationsAppEngine,
  MockEngine,
} from '../../test/mock-engine';
import {ProductRecommendationsAppState} from '../../state/product-recommendations-app-state';
import {
  buildBaseProductRecommendationsList,
  ProductRecommendationsList,
  ProductRecommendationsListOptions,
} from './headless-base-product-recommendations';
import {buildMockProductRecommendationsState} from '../../test/mock-product-recommendations-state';
import {Action} from 'redux';
import {
  getProductRecommendations,
  setProductRecommendationsMaxNumberOfRecommendations,
  setProductRecommendationsRecommenderId,
  setProductRecommendationsSkus,
} from '../../features/product-recommendations/product-recommendations-actions';

describe('headless product-recommendations', () => {
  let state: ProductRecommendationsAppState;
  let productRecommendations: ProductRecommendationsList;
  let engine: MockEngine<ProductRecommendationsAppState>;

  const baseOptions: Partial<ProductRecommendationsListOptions> = {
    id: 'bloup',
    skus: ['bloup-123'],
  };

  beforeEach(() => {
    state = buildMockProductRecommendationsState();
    engine = buildMockProductRecommendationsAppEngine({state});
    productRecommendations = buildBaseProductRecommendationsList(engine, {
      options: baseOptions,
    });
  });

  const expectContainAction = (action: Action) => {
    const found = engine.actions.find((a) => a.type === action.type);
    expect(engine.actions).toContainEqual(found);
  };

  it('when options.id is set to a non empty value, it dispatches #setProductRecommendationsRecommenderId', () => {
    productRecommendations = buildBaseProductRecommendationsList(engine, {
      options: baseOptions,
    });
    expectContainAction(setProductRecommendationsRecommenderId);
  });

  it('when options.maxNumberOfRecommendations is set to a non empty value, it dispatches #setProductRecommendationsMaxNumberOfRecommendations', () => {
    productRecommendations = buildBaseProductRecommendationsList(engine, {
      options: {...baseOptions, maxNumberOfRecommendations: 10},
    });
    expectContainAction(setProductRecommendationsMaxNumberOfRecommendations);
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

  it('when options.skus is set to an empty array, it throws a schema validation error', () => {
    expect(() =>
      buildBaseProductRecommendationsList(engine, {
        options: {...baseOptions, skus: []},
      })
    ).toThrowError();
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
