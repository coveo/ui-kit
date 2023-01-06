import {ArrayValue, NumberValue} from '@coveo/bueno';
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

const numberValue = new NumberValue({required: true, min: 0});

interface RegisterUserActionsPayload {
  ticketCreationDate: string;
  numberSessionsBefore?: number;
  numberSessionsAfter?: number;
  excludedCustomActions?: string[];
}

const registerUserActionsPayloadSchema = {
  ticketCreationDate: nonEmptyString,
  excludedCustomActions: new ArrayValue({
    required: false,
    each: nonEmptyString,
  }),
  numberSessionsBefore: numberValue,
  numberSessionsAfter: numberValue,
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
      await buildFetchUserActionsRequest(state)
    );

    if (isErrorResponse(fetched)) {
      return rejectWithValue(fetched.error);
    }

    return {
      response: fetched.success,
    };
  }
);
