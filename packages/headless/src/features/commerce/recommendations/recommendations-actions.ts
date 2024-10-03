import {RecordValue, StringValue} from '@coveo/bueno';
import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {
  AsyncThunkCommerceOptions,
  isErrorResponse,
} from '../../../api/commerce/commerce-api-client.js';
import {ChildProduct} from '../../../api/commerce/common/product.js';
import {CommerceRecommendationsRequest} from '../../../api/commerce/recommendations/recommendations-request.js';
import {RecommendationsCommerceSuccessResponse} from '../../../api/commerce/recommendations/recommendations-response.js';
import {NavigatorContext} from '../../../app/navigatorContextProvider.js';
import {RecommendationsSection} from '../../../state/state-sections.js';
import {validatePayload} from '../../../utils/validate-payload.js';
import {
  StateNeededByQueryCommerceAPI,
  buildBaseCommerceAPIRequest,
} from '../common/actions.js';
import {getProductsFromCartPurchasedState} from '../context/cart/cart-state.js';
import {perPageRecommendationSelector} from '../pagination/pagination-selectors.js';
import {
  moreRecommendationsAvailableSelector,
  numberOfRecommendationsSelector,
} from './recommendations-selectors.js';
import {recommendationsSlotDefinition} from './recommendations.js';

export interface QueryRecommendationsCommerceAPIThunkReturn {
  /** The successful recommendations response. */
  response: RecommendationsCommerceSuccessResponse;
}

export type StateNeededByFetchRecommendations = StateNeededByQueryCommerceAPI &
  RecommendationsSection;

const buildRecommendationCommerceAPIRequest = (
  slotId: string,
  state: StateNeededByFetchRecommendations,
  navigatorContext: NavigatorContext,
  productId?: string
): CommerceRecommendationsRequest => {
  const commerceAPIRequest = buildBaseCommerceAPIRequest(
    state,
    navigatorContext,
    slotId
  );
  return {
    ...commerceAPIRequest,
    context: {
      ...commerceAPIRequest.context,
      ...(productId ? {product: {productId}} : {}),
      purchased: getProductsFromCartPurchasedState(state.cart),
    },
    slotId,
  };
};

export interface FetchRecommendationsPayload {
  /**
   * The unique identifier of the recommendations slot (e.g., `b953ab2e-022b-4de4-903f-68b2c0682942`).
   */
  slotId: string;
  productId?: string;
}

export const fetchRecommendations = createAsyncThunk<
  QueryRecommendationsCommerceAPIThunkReturn,
  FetchRecommendationsPayload,
  AsyncThunkCommerceOptions<StateNeededByFetchRecommendations>
>(
  'commerce/recommendations/fetch',
  async (
    payload,
    {getState, rejectWithValue, extra: {apiClient, navigatorContext}}
  ) => {
    const {slotId, productId} = payload;
    const request = buildRecommendationCommerceAPIRequest(
      slotId,
      getState(),
      navigatorContext,
      productId
    );
    const fetched = await apiClient.getRecommendations(request);

    if (isErrorResponse(fetched)) {
      return rejectWithValue(fetched.error);
    }

    return {
      response: fetched.success,
    };
  }
);

export type FetchMoreRecommendationsPayload = FetchRecommendationsPayload;

export const fetchMoreRecommendations = createAsyncThunk<
  QueryRecommendationsCommerceAPIThunkReturn | null,
  FetchMoreRecommendationsPayload,
  AsyncThunkCommerceOptions<StateNeededByFetchRecommendations>
>(
  'commerce/recommendations/fetchMore',
  async (
    payload,
    {getState, rejectWithValue, extra: {apiClient, navigatorContext}}
  ) => {
    const slotId = payload.slotId;
    const state = getState();
    const moreRecommendationsAvailable = moreRecommendationsAvailableSelector(
      state,
      slotId
    );
    if (!moreRecommendationsAvailable === false) {
      return null;
    }

    const perPage = perPageRecommendationSelector(state, slotId);
    const numberOfProducts = numberOfRecommendationsSelector(state, slotId);
    const nextPageToRequest = numberOfProducts / perPage;

    const request = {
      ...buildRecommendationCommerceAPIRequest(slotId, state, navigatorContext),
      page: nextPageToRequest,
    };
    const fetched = await apiClient.getRecommendations(request);

    if (isErrorResponse(fetched)) {
      return rejectWithValue(fetched.error);
    }

    return {
      response: fetched.success,
    };
  }
);

export interface SlotIdPayload {
  slotId: string;
}

export type RegisterRecommendationsSlotPayload = SlotIdPayload;

export const registerRecommendationsSlot = createAction(
  'commerce/recommendations/registerSlot',
  (payload: RegisterRecommendationsSlotPayload) =>
    validatePayload(payload, recommendationsSlotDefinition)
);

export interface PromoteChildToParentPayload extends SlotIdPayload {
  child: ChildProduct;
}

export const promoteChildToParentDefinition = {
  child: new RecordValue({
    options: {required: true},
    values: {
      permanentid: new StringValue({required: true}),
    },
  }),
  ...recommendationsSlotDefinition,
};

export const promoteChildToParent = createAction(
  'commerce/recommendations/promoteChildToParent',
  (payload: PromoteChildToParentPayload) =>
    validatePayload(payload, promoteChildToParentDefinition)
);
