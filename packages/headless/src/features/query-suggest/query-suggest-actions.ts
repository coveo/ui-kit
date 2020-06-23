import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {SearchPageState} from '../../state';
import {getQuerySuggestions} from '../../api/search/query-suggest/query-suggest-endpoint';
import {validatePayloadSchema} from '../../utils/validate-payload';
import {NumberValue, StringValue, Schema} from '@coveo/bueno';

const idDefinition = {
  id: new StringValue({required: true, emptyAllowed: false}),
};

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
export const fetchQuerySuggestions = createAsyncThunk(
  'querySuggest/fetch',

  async (payload: {id: string}, {getState}) =>
    await getQuerySuggestions(payload.id, getState() as SearchPageState),
  {
    condition: (payload: {id: string}) => {
      new Schema(idDefinition).validate(payload);
      return true;
    },
  }
);
