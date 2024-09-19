import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {getSearchApiBaseUrl} from '../../api/platform-client';
import {FieldDescription} from '../../api/search/fields/fields-response';
import {
  AsyncThunkSearchOptions,
  isErrorResponse,
} from '../../api/search/search-api-client';
import {ConfigurationSection} from '../../state/state-sections';
import {
  validatePayload,
  nonEmptyStringArray,
} from '../../utils/validate-payload';

export const registerFieldsToInclude = createAction(
  'fields/registerFieldsToInclude',
  (payload: string[]) => validatePayload<string[]>(payload, nonEmptyStringArray)
);

export const enableFetchAllFields = createAction('fields/fetchall/enable');

export const disableFetchAllFields = createAction('fields/fetchall/disable');

export const fetchFieldsDescription = createAsyncThunk<
  FieldDescription[],
  void,
  AsyncThunkSearchOptions<ConfigurationSection>
>('fields/fetchDescription', async (_, {extra, getState, rejectWithValue}) => {
  const state = getState();
  const {accessToken, environment, organizationId} = state.configuration;
  const {apiBaseUrl} = state.configuration.search;
  const descriptions = await extra.apiClient.fieldDescriptions({
    accessToken,
    organizationId,
    url: apiBaseUrl ?? getSearchApiBaseUrl(organizationId, environment),
  });
  if (isErrorResponse(descriptions)) {
    return rejectWithValue(descriptions.error);
  }
  return descriptions.success.fields;
});
