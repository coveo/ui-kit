import {buildMockProductRecommendations} from '../../test/mock-product-recommendations';
import {buildMockProductRecommendation} from '../../test/mock-product';
import {
  getProductRecommendations,
  setProductRecommendationsSkus,
} from './product-recommendations-actions';
import {productRecommendationsReducer} from './product-recommendations-slice';
import {
  getProductRecommendationsInitialState,
  ProductRecommendationsState,
} from './product-recommendations-state';

describe('frequently-bought-together slice', () => {
  let state: ProductRecommendationsState;
  beforeEach(() => {
    state = getProductRecommendationsInitialState();
  });
  it('should have an initial state', () => {
    expect(productRecommendationsReducer(undefined, {type: 'foo'})).toEqual(
      getProductRecommendationsInitialState()
    );
  });

  it('should allow to set the product recommendations skus', () => {
    expect(
      productRecommendationsReducer(
        state,
        setProductRecommendationsSkus({skus: ['foo']})
      ).skus
    ).toEqual(['foo']);
  });

  it('when a getProductRecommendations fulfilled is received, it updates the state to the received payload', () => {
    const result = buildMockProductRecommendation();
    const response = buildMockProductRecommendations({
      recommendations: [result],
    });

    const action = getProductRecommendations.fulfilled(response, '');
    const finalState = productRecommendationsReducer(state, action);

    expect(finalState.recommendations[0]).toEqual(result);
    expect(finalState.isLoading).toBe(false);
  });

  it('set the error on rejection', () => {
    const err = {
      message: 'message',
      statusCode: 500,
      type: 'type',
    };
    const action = {type: 'productrecommendations/get/rejected', payload: err};
    const finalState = productRecommendationsReducer(state, action);
    expect(finalState.error).toEqual(err);
    expect(finalState.isLoading).toBe(false);
  });

  it('set the error to null on success', () => {
    const err = {message: 'message', statusCode: 500, type: 'type'};
    state.error = err;

    const response = buildMockProductRecommendations();

    const action = getProductRecommendations.fulfilled(response, '');
    const finalState = productRecommendationsReducer(state, action);
    expect(finalState.error).toBeNull();
  });

  it('set the isLoading state to true during getProductRecommendations.pending', () => {
    const pendingAction = getProductRecommendations.pending('');
    const finalState = productRecommendationsReducer(state, pendingAction);
    expect(finalState.isLoading).toBe(true);
  });
});
