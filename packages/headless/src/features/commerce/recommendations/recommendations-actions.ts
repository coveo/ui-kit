import {StringValue} from '@coveo/bueno';
import {Relay} from '@coveo/relay';
import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {
  AsyncThunkCommerceOptions,
  isErrorResponse,
} from '../../../api/commerce/commerce-api-client';
import {CommerceRecommendationsRequest} from '../../../api/commerce/recommendations/recommendations-request';
import {RecommendationsCommerceSuccessResponse} from '../../../api/commerce/recommendations/recommendations-response';
import {RecommendationsSection} from '../../../state/state-sections';
import {validatePayload} from '../../../utils/validate-payload';
import {
  StateNeededByQueryCommerceAPI,
  buildBaseCommerceAPIRequest,
} from '../common/actions';
import {getProductsFromCartPurchasedState} from '../context/cart/cart-state';
import {perPageRecommendationSelector} from '../pagination/pagination-selectors';
import {recommendationsSlotDefinition} from './recommendations';
import {
  moreRecommendationsAvailableSelector,
  numberOfRecommendationsSelector,
} from './recommendations-selectors';

export interface QueryRecommendationsCommerceAPIThunkReturn {
  /** The successful recommendations response. */
  response: RecommendationsCommerceSuccessResponse;
}

export type StateNeededByFetchRecommendations = StateNeededByQueryCommerceAPI &
  RecommendationsSection;

const buildRecommendationCommerceAPIRequest = (
  slotId: string,
  state: StateNeededByFetchRecommendations,
  relay: Relay,
  productId?: string
): CommerceRecommendationsRequest => {
  const commerceAPIRequest = buildBaseCommerceAPIRequest(state, relay, slotId);
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

export interface FetchRecommendationsActionCreatorPayload {
  /**
   * The unique identifier of the recommendations slot (e.g., `b953ab2e-022b-4de4-903f-68b2c0682942`).
   */
  slotId: string;
  productId?: string;
}

export const fetchRecommendations = createAsyncThunk<
  QueryRecommendationsCommerceAPIThunkReturn,
  FetchRecommendationsActionCreatorPayload,
  AsyncThunkCommerceOptions<StateNeededByFetchRecommendations>
>(
  'commerce/recommendations/fetch',
  async (payload, {getState, rejectWithValue, extra: {apiClient, relay}}) => {
    const {slotId, productId} = payload;
    const request = buildRecommendationCommerceAPIRequest(
      slotId,
      getState(),
      relay,
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

export type FetchMoreRecommendationsActionCreatorPayload =
  FetchRecommendationsActionCreatorPayload;

export const fetchMoreRecommendations = createAsyncThunk<
  QueryRecommendationsCommerceAPIThunkReturn | null,
  FetchMoreRecommendationsActionCreatorPayload,
  AsyncThunkCommerceOptions<StateNeededByFetchRecommendations>
>(
  'commerce/recommendations/fetchMore',
  async (payload, {getState, rejectWithValue, extra: {apiClient, relay}}) => {
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
      ...buildRecommendationCommerceAPIRequest(slotId, state, relay),
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

export type RegisterRecommendationsSlotActionCreatorPayload = SlotIdPayload;

export const registerRecommendationsSlot = createAction(
  'commerce/recommendations/registerSlot',
  (payload: RegisterRecommendationsSlotActionCreatorPayload) =>
    validatePayload(payload, recommendationsSlotDefinition)
);

export interface PromoteChildToParentActionCreatorPayload
  extends SlotIdPayload {
  childPermanentId: string;
  parentPermanentId: string;
}

export const promoteChildToParentDefinition = {
  childPermanentId: new StringValue({required: true}),
  parentPermanentId: new StringValue({required: true}),
  ...recommendationsSlotDefinition,
};

export const promoteChildToParent = createAction(
  'commerce/recommendations/promoteChildToParent',
  (payload: PromoteChildToParentActionCreatorPayload) =>
    validatePayload(payload, promoteChildToParentDefinition)
);
