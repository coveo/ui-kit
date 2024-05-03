import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {
  AsyncThunkCommerceOptions,
  isErrorResponse,
} from '../../../api/commerce/commerce-api-client';
import {CommerceRecommendationsRequest} from '../../../api/commerce/recommendations/recommendations-request';
import {RecommendationsCommerceSuccessResponse} from '../../../api/commerce/recommendations/recommendations-response';
import {validatePayload} from '../../../utils/validate-payload';
import {getPaginationInitialState} from '../../pagination/pagination-state';
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
  state: StateNeededByQueryCommerceAPI
): Promise<CommerceRecommendationsRequest> => {
  const commerceAPIRequest = await buildBaseCommerceAPIRequest(state, slotId);
  return {
    ...commerceAPIRequest,
    slotId,
  };
};

export interface FetchRecommendationsActionCreatorPayload {
  /**
   * The unique identifier of the recommendations slot (e.g., `b953ab2e-022b-4de4-903f-68b2c0682942`).
   */
  slotId: string;
}

export const fetchRecommendations = createAsyncThunk<
  QueryRecommendationsCommerceAPIThunkReturn,
  FetchRecommendationsActionCreatorPayload,
  AsyncThunkCommerceOptions<StateNeededByQueryCommerceAPI>
>(
  'commerce/recommendations/fetch',
  async (payload, {getState, rejectWithValue, extra: {apiClient}}) => {
    const slotId = payload.slotId;
    const request = await buildRecommendationCommerceAPIRequest(
      slotId,
      getState()
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
  QueryRecommendationsCommerceAPIThunkReturn,
  FetchRecommendationsActionCreatorPayload,
  AsyncThunkCommerceOptions<StateNeededByQueryCommerceAPI>
>(
  'commerce/recommendations/fetchMore',
  async (payload, {getState, rejectWithValue, extra: {apiClient}}) => {
    const slotId = payload.slotId;
    const state = getState();

    const perPage =
      state.commercePagination?.recommendations[slotId]?.perPage ||
      getPaginationInitialState().defaultNumberOfResults;
    const currentNumberOfRecommendation =
      state.recommendations[slotId]?.products.length || 0;
    const nextPage = currentNumberOfRecommendation / perPage;

    const request = {
      ...(await buildRecommendationCommerceAPIRequest(slotId, state)),
      page: nextPage,
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
