import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {HeadlessState} from '../../state';
import {getQuerySuggestions} from '../../api/search/query-suggest/query-suggest-endpoint';

/**
 * Register a new query suggest entity to the headless state to enable the Coveo ML query suggestions feature.
 * @param id A unique identifier for the new query suggest entity (e.g., `b953ab2e-022b-4de4-903f-68b2c0682942`).
 * @param q The partial basic query expression for which to request query suggestions (e.g., `cov`).
 * @param count The number of query suggestions to request from Coveo ML (e.g., `3`).
 */
export const registerQuerySuggest = createAction<{
  id: string;
  q?: string;
  count?: number;
}>('querySuggest/register');

/**
 * Unregister an existing query suggest entity from the headless state.
 * @param id The unique identifier of the query suggest entity to unregister (e.g., `b953ab2e-022b-4de4-903f-68b2c0682942`).
 */
export const unregisterQuerySuggest = createAction<{id: string}>(
  'querySuggest/unregister'
);

/**
 * Update the current partial basic query expression for a specific query suggest entity.
 * @param id The unique identifier of the target query suggest entity (e.g., `b953ab2e-022b-4de4-903f-68b2c0682942`).
 * @param q The new partial basic query expression for which to request query suggestions (e.g., `cove`).
 */
export const updateQuerySuggestQuery = createAction<{id: string; q: string}>(
  'querySuggest/updateQuery'
);

/**
 * Select a suggestion provided through a specific query suggest entity.
 * @param id The unique identifier of the target query suggest entity (e.g., `b953ab2e-022b-4de4-903f-68b2c0682942`).
 * @param expression The selected query suggestion (e.g., `coveo`).
 */
export const selectQuerySuggestion = createAction<{
  id: string;
  expression: string;
}>('querySuggest/selectSuggestion');

/**
 * Clear the current partial basic query expression and list of query suggestions in a specific query suggest entity.
 * @param id The unique identifier of the target query suggest entity (e.g., `b953ab2e-022b-4de4-903f-68b2c0682942`).
 */
export const clearQuerySuggest = createAction<{id: string}>(
  'querySuggest/clear'
);

/**
 * Clear the list of query suggestions in a specific query suggest entity.
 * @param id The unique identifier of the target query suggest entity (e.g., b953ab2e-022b-4de4-903f-68b2c0682942).
 */
export const clearQuerySuggestCompletions = createAction<{id: string}>(
  'querySuggest/clearSuggestions'
);

/**
 * Fetch a list of query suggestions for a specific query suggest entity according to the current headless state.
 * @param id The unique identifier of the target query suggest entity (e.g., b953ab2e-022b-4de4-903f-68b2c0682942).
 */
export const fetchQuerySuggestions = createAsyncThunk(
  'querySuggest/fetch',
  async ({id}: {id: string}, {getState}) => {
    return await getQuerySuggestions(id, getState() as HeadlessState);
  }
);
