import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {AsyncThunkCommerceOptions} from '../../../api/commerce/commerce-api-client';
import {RecommendationsCommerceSuccessResponse} from '../../../api/commerce/common/response';
import {CommerceRecommendationsRequest} from '../../../api/commerce/recommendations/recommendations-request';
import {isErrorResponse} from '../../../api/search/search-api-client';
import {validatePayload} from '../../../utils/validate-payload';
import {logQueryError} from '../../search/search-analytics-actions';
import {
  buildCommerceAPIRequest,
  StateNeededByQueryCommerceAPI,
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
  const commerceAPIRequest = await buildCommerceAPIRequest(state);
  delete commerceAPIRequest.facets;
  return {
    ...commerceAPIRequest,
    id: slotId,
  };
};

export const fetchRecommendations = createAsyncThunk<
  QueryRecommendationsCommerceAPIThunkReturn,
  void,
  AsyncThunkCommerceOptions<StateNeededByQueryCommerceAPI>
>(
  'commerce/recommendation/fetch',
  async (_action, {getState, dispatch, rejectWithValue, extra}) => {
    const state = getState(); // TODO: Add slot id to the state
    const {apiClient} = extra;
    const fetched = await apiClient.getRecommendations(
      await buildRecommendationCommerceAPIRequest(
        state.recommendations?.slotId || '',
        state
      )
    );

    if (isErrorResponse(fetched)) {
      dispatch(logQueryError(fetched.error));
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

export const updateRecommendationsSlotId = createAction(
  'recommendation/updateSlotId',
  (payload: SlotIdPayload) =>
    validatePayload(payload, recommendationsSlotDefinition)
);
