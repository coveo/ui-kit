import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {
  validatePayload,
  requiredNonEmptyString,
} from '../../utils/validate-payload';
import {ArrayValue, BooleanValue} from '@coveo/bueno';
import {
  AsyncThunkSearchOptions,
  isErrorResponse,
} from '../../api/search/search-api-client';
import {ConfigurationSection} from '../../state/state-sections';
import {FieldDescription} from '../../api/search/fields/fields-response';

const nonEmptyArray = new ArrayValue({
  each: requiredNonEmptyString,
  required: true,
});

/**
 * Registers the fields to include in the query response.
 * @param payload (string[]) The target fields (e.g., `["field1", "field2"]`).
 */
export const registerFieldsToInclude = createAction(
  'fields/registerFieldsToInclude',
  (payload: string[]) => validatePayload<string[]>(payload, nonEmptyArray)
);

/**
 * Enable retrieve all fields.
 */
export const debugFields = createAction('fields/debug', (fetchAll: boolean) =>
  validatePayload(fetchAll, new BooleanValue({required: true}))
);

/**
 * Retrieve fields descrption from the index.
 */
export const fetchFieldsDescription = createAsyncThunk<
  FieldDescription[],
  void,
  AsyncThunkSearchOptions<ConfigurationSection>
>('fields/description', async (_, {extra, getState, rejectWithValue}) => {
  const state = getState();
  const {accessToken, organizationId} = state.configuration;
  const {apiBaseUrl} = state.configuration.search;
  const descriptions = await extra.searchAPIClient.fieldsDescription({
    accessToken,
    organizationId,
    url: apiBaseUrl,
  });
  if (isErrorResponse(descriptions)) {
    return rejectWithValue(descriptions.error);
  }
  return descriptions.success.fields;
});
