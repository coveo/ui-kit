import {ArrayValue, StringValue} from '@coveo/bueno';
import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {isErrorResponse} from '../../api/search/search-api-client';
import {AsyncThunkInsightOptions} from '../../api/service/insight/insight-api-client';
import {InsightUserActionsResponse} from '../../api/service/insight/user-actions/user-actions-response';
import {
  ConfigurationSection,
  InsightConfigurationSection,
  InsightUserActionSection,
} from '../../state/state-sections';
import {nonEmptyString, validatePayload} from '../../utils/validate-payload';
import {buildFetchUserActionsRequest} from './insight-user-actions-request';

interface RegisterUserActionsPayload {
  ticketCreationDate: string;
  userId: string;
  excludedCustomActions?: string[];
}

const registerUserActionsPayloadSchema = {
  ticketCreationDate: new StringValue({
    emptyAllowed: false,
    ISODate: true,
  }),
  userId: new StringValue({
    emptyAllowed: false,
  }),
  excludedCustomActions: new ArrayValue({
    required: false,
    each: nonEmptyString,
  }),
};

export const registerUserActions = createAction(
  'insight/userActions/registerUserActions',
  (payload: RegisterUserActionsPayload) =>
    validatePayload(payload, registerUserActionsPayloadSchema)
);

export interface FetchUserActionsThunkReturn {
  /** The successful user actions response. */
  response: InsightUserActionsResponse;
}

export type StateNeededByFetchUserActions = ConfigurationSection &
  InsightConfigurationSection &
  InsightUserActionSection;

export const fetchUserActions = createAsyncThunk<
  FetchUserActionsThunkReturn,
  void,
  AsyncThunkInsightOptions<StateNeededByFetchUserActions>
>(
  'insight/userActions/fetch',
  async (_, {getState, rejectWithValue, extra: {apiClient}}) => {
    const state = getState();

    const fetched = await apiClient.userActions(
      await buildFetchUserActionsRequest(state, state.insightUserAction.userId)
    );

    if (isErrorResponse(fetched)) {
      return rejectWithValue(fetched.error);
    }

    return {
      response: fetched.success,
    };
  }
);
