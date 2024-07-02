import {RecordValue, StringValue} from '@coveo/bueno';
import {Relay} from '@coveo/relay';
import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {
  AsyncThunkCommerceOptions,
  isErrorResponse,
} from '../../../api/commerce/commerce-api-client';
import {ChildProduct} from '../../../api/commerce/common/product';
import {CommerceRecommendationsRequest} from '../../../api/commerce/recommendations/recommendations-request';
import {RecommendationsCommerceSuccessResponse} from '../../../api/commerce/recommendations/recommendations-response';
import {NavigatorContext} from '../../../app/navigatorContextProvider';
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
  navigatorContext: NavigatorContext,
  productId?: string
): CommerceRecommendationsRequest => {
  const commerceAPIRequest = buildBaseCommerceAPIRequest(
    state,
    relay,
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
  async (
    payload,
    {getState, rejectWithValue, extra: {apiClient, relay, navigatorContext}}
  ) => {
    const {slotId, productId} = payload;
    const request = buildRecommendationCommerceAPIRequest(
      slotId,
      getState(),
      relay,
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

export const fetchMoreRecommendations = createAsyncThunk<
  QueryRecommendationsCommerceAPIThunkReturn | null,
  FetchRecommendationsActionCreatorPayload,
  AsyncThunkCommerceOptions<StateNeededByFetchRecommendations>
>(
  'commerce/recommendations/fetchMore',
  async (
    payload,
    {getState, rejectWithValue, extra: {apiClient, relay, navigatorContext}}
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
      ...buildRecommendationCommerceAPIRequest(
        slotId,
        state,
        relay,
        navigatorContext
      ),
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

export const registerRecommendationsSlot = createAction(
  'commerce/recommendations/registerSlot',
  (payload: SlotIdPayload) =>
    validatePayload(payload, recommendationsSlotDefinition)
);

export interface PromoteChildToParentActionCreatorPayload
  extends SlotIdPayload {
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
  (payload: PromoteChildToParentActionCreatorPayload) =>
    validatePayload(payload, promoteChildToParentDefinition)
);
