import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {SearchPageState} from '../../state';
import {validatePayloadSchema} from '../../utils/validate-payload';
import {NumberValue, StringValue} from '@coveo/bueno';
import {QuerySuggestSuccessResponse} from '../../api/search/query-suggest/query-suggest-response';
import {SearchAPIErrorWithStatusCode} from '../../api/search/search-api-error-response';
import {
  isErrorResponse,
  AsyncThunkSearchOptions,
} from '../../api/search/search-api-client';

const idDefinition = {
  id: new StringValue({required: true, emptyAllowed: false}),
};

export interface QuerySuggestionID {
  id: string;
}

/**
 * Register a new query suggest entity to the headless state to enable the Coveo ML query suggestions feature.
 * @param id A unique identifier for the new query suggest entity (e.g., `b953ab2e-022b-4de4-903f-68b2c0682942`).
 * @param q The partial basic query expression for which to request query suggestions (e.g., `cov`).
 * @param count The number of query suggestions to request from Coveo ML (e.g., `3`). Default: `5`.
 */
export const registerQuerySuggest = createAction(
  'querySuggest/register',
  (payload: {id: string; q?: string; count?: number}) =>
    validatePayloadSchema(payload, {
      ...idDefinition,
      q: new StringValue(),
      count: new NumberValue({min: 0}),
    })
);

/**
 * Unregister an existing query suggest entity from the headless state.
 * @param id The unique identifier of the query suggest entity to unregister (e.g., `b953ab2e-022b-4de4-903f-68b2c0682942`).
 */
export const unregisterQuerySuggest = createAction(
  'querySuggest/unregister',
  (payload: {id: string}) => validatePayloadSchema(payload, idDefinition)
);

/**
 * Select a suggestion provided through a specific query suggest entity.
 * @param id The unique identifier of the target query suggest entity (e.g., `b953ab2e-022b-4de4-903f-68b2c0682942`).
 * @param expression The selected query suggestion (e.g., `coveo`).
 */
export const selectQuerySuggestion = createAction(
  'querySuggest/selectSuggestion',
  (payload: {id: string; expression: string}) =>
    validatePayloadSchema(payload, {
      ...idDefinition,
      expression: new StringValue({required: true}),
    })
);

/**
 * Clear the current partial basic query expression and list of query suggestions in a specific query suggest entity.
 * @param id The unique identifier of the target query suggest entity (e.g., `b953ab2e-022b-4de4-903f-68b2c0682942`).
 */
export const clearQuerySuggest = createAction(
  'querySuggest/clear',
  (payload: {id: string}) => validatePayloadSchema(payload, idDefinition)
);

/**
 * Clear the list of query suggestions in a specific query suggest entity.
 * @param id The unique identifier of the target query suggest entity (e.g., b953ab2e-022b-4de4-903f-68b2c0682942).
 */
export const clearQuerySuggestCompletions = createAction(
  'querySuggest/clearSuggestions',
  (payload: {id: string}) => validatePayloadSchema(payload, idDefinition)
);

/**
 * Fetch a list of query suggestions for a specific query suggest entity according to the current headless state.
 * @param id The unique identifier of the target query suggest entity (e.g., b953ab2e-022b-4de4-903f-68b2c0682942).
 */
export const fetchQuerySuggestions = createAsyncThunk<
  QuerySuggestionID & QuerySuggestSuccessResponse,
  QuerySuggestionID,
  AsyncThunkSearchOptions & {
    rejectValue: SearchAPIErrorWithStatusCode & QuerySuggestionID;
  }
>(
  'querySuggest/fetch',

  async (
    payload: {id: string},
    {getState, rejectWithValue, extra: {searchAPIClient}}
  ) => {
    validatePayloadSchema(payload, idDefinition);
    const id = payload.id;
    const response = await searchAPIClient.querySuggest(
      id,
      getState() as SearchPageState
    );

    if (isErrorResponse(response)) {
      return rejectWithValue({id, ...response.error});
    }

    return {
      id,
      ...response.success,
    };
  }
);
