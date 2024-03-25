import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {AsyncThunkCommerceOptions} from '../../../api/commerce/commerce-api-client';
import {CommerceRecommendationRequest} from '../../../api/commerce/recommendation/recommendation-request';
import {isErrorResponse} from '../../../api/search/search-api-client';
import {nonEmptyString, validatePayload} from '../../../utils/validate-payload';
import {logQueryError} from '../../search/search-analytics-actions';
import {
  buildCommerceAPIRequest,
  QueryRecommendationCommerceAPIThunkReturn,
  StateNeededByQueryCommerceAPI,
} from '../common/actions';

const buildRecommendationCommerceAPIRequest = async (
  slotId: string,
  state: StateNeededByQueryCommerceAPI
): Promise<CommerceRecommendationRequest> => {
  const commerceAPIRequest = await buildCommerceAPIRequest(state);
  delete commerceAPIRequest.facets;
  return {
    ...commerceAPIRequest,
    id: slotId,
  };
};

export const fetchRecommendations = createAsyncThunk<
  QueryRecommendationCommerceAPIThunkReturn,
  void,
  AsyncThunkCommerceOptions<StateNeededByQueryCommerceAPI>
>(
  'commerce/recommendation/fetch',
  async (_action, {getState, dispatch, rejectWithValue, extra}) => {
    const state = getState(); // TODO: Add slot id to the state
    const {apiClient} = extra;
    const fetched = await apiClient.getRecommendation(
      await buildRecommendationCommerceAPIRequest(
        state.recommendation.slotId,
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

export const updateRecommendationSlotId = createAction(
  'recommendation/updateSlotId',
  (payload: SlotIdPayload) => validatePayload(payload, {slotId: nonEmptyString})
);
