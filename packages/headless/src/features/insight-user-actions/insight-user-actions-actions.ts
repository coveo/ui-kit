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
import {buildFetchUserActionRequest} from './insight-user-actions-request';

const numberValue = new NumberValue({required: true, min: 0});

export const updateTicketCreationDate = createAction(
  'insight/userActions/updateTicketCreationDate',
  (payload: string) => validatePayload(payload, nonEmptyString)
);

export const updateNumberOfSessionsBefore = createAction(
  'insight/userActions/updateNumberOfSessionsBefore',
  (payload: number) => validatePayload(payload, numberValue)
);

export const updateNumberOfSessionsAfter = createAction(
  'insight/userActions/updateNumberOfSessionsAfter',
  (payload: number) => validatePayload(payload, numberValue)
);

export const updateExcludedCustomActions = createAction(
  'insight/userActions/updateExcludedCustomActions',
  (payload: string[]) =>
    validatePayload(
      payload,
      new ArrayValue({
        each: nonEmptyString,
      })
    )
);

export interface FetchUserActionsThunkReturn {
  /** The successful user actions response. */
  response: InsightUserActionsResponse;
}

export type StateNeededByFetchUserActions = ConfigurationSection &
  InsightConfigurationSection &
  InsightUserActionSection;

export const fetcUserActions = createAsyncThunk<
  FetchUserActionsThunkReturn,
  void,
  AsyncThunkInsightOptions<StateNeededByFetchUserActions>
>(
  'insight/userActions/fetch',
  async (_, {getState, rejectWithValue, extra: {apiClient}}) => {
    const state = getState();

    const fetched = await apiClient.userActions(
      await buildFetchUserActionRequest(state)
    );

    if (isErrorResponse(fetched)) {
      return rejectWithValue(fetched.error);
    }

    return {
      response: fetched.success,
    };
  }
);
