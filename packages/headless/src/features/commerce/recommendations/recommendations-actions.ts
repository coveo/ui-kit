import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {
  AsyncThunkCommerceOptions,
  isErrorResponse,
} from '../../../api/commerce/commerce-api-client';
import {CommerceRecommendationsRequest} from '../../../api/commerce/recommendations/recommendations-request';
import {RecommendationsCommerceSuccessResponse} from '../../../api/commerce/recommendations/recommendations-response';
import {validatePayload} from '../../../utils/validate-payload';
import {
  StateNeededByQueryCommerceAPI,
  buildBaseCommerceAPIRequest,
} from '../common/actions';
import {recommendationsSlotDefinition} from './recommendations';

export interface QueryRecommendationsCommerceAPIThunkReturn {
  /** The successful recommendations response. */
  response: RecommendationsCommerceSuccessResponse;
}

const buildRecommendationCommerceAPIRequest = async (
  slotId: string,
  state: StateNeededByQueryCommerceAPI,
  productId?: string
): Promise<CommerceRecommendationsRequest> => {
  const commerceAPIRequest = await buildBaseCommerceAPIRequest(state, slotId);
  return {
    ...commerceAPIRequest,
    context: {
      ...commerceAPIRequest.context,
      ...(productId ? {product: {productId}} : {}),
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
  AsyncThunkCommerceOptions<StateNeededByQueryCommerceAPI>
>(
  'commerce/recommendations/fetch',
  async (payload, {getState, rejectWithValue, extra: {apiClient}}) => {
    const {slotId, productId} = payload;
    const request = await buildRecommendationCommerceAPIRequest(
      slotId,
      getState(),
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

export interface SlotIdPayload {
  slotId: string;
}

export const registerRecommendationsSlot = createAction(
  'commerce/recommendations/registerSlot',
  (payload: SlotIdPayload) =>
    validatePayload(payload, recommendationsSlotDefinition)
);
