import {isNullOrUndefined} from '@coveo/bueno';
import {createReducer} from '@reduxjs/toolkit';
import {
  getQuerySetInitialState,
  type QuerySetState,
} from '../../query-set/query-set-state.js';
import {selectQuerySuggestion} from '../query-suggest/query-suggest-actions.js';
import {executeSearch} from '../search/search-actions.js';
import {
  type CommerceSearchParameters,
  restoreSearchParameters,
} from '../search-parameters/search-parameters-actions.js';
import {
  type RegisterQuerySetQueryPayload,
  registerQuerySetQuery,
  updateQuerySetQuery,
} from './query-set-actions.js';

export const commerceQuerySetReducer = createReducer(
  getQuerySetInitialState(),
  (builder) => {
    builder
      .addCase(registerQuerySetQuery, (state, action) =>
        registerQuery(state, action.payload)
      )
      .addCase(updateQuerySetQuery, (state, action) => {
        const {id, query} = action.payload;
        updateQuery(state, id, query);
      })
      .addCase(selectQuerySuggestion, (state, action) => {
        const {id, expression} = action.payload;
        updateQuery(state, id, expression);
      })
      .addCase(executeSearch.fulfilled, (state, action) => {
        const {queryExecuted} = action.payload;
        updateAllQuerySetQuery(state, queryExecuted);
      })
      .addCase(restoreSearchParameters, handleRestoreSearchParameters);
  }
);

function handleRestoreSearchParameters(
  state: QuerySetState,
  action: {
    payload: CommerceSearchParameters;
  }
) {
  if (!isNullOrUndefined(action.payload.q)) {
    updateAllQuerySetQuery(state, action.payload.q);
  }
}

function updateAllQuerySetQuery(state: QuerySetState, query: string) {
  Object.keys(state).forEach((id) => {
    state[id] = query;
  });
}

const updateQuery = (state: QuerySetState, id: string, query: string) => {
  if (id in state) {
    state[id] = query;
  }
};

const registerQuery = (
  state: QuerySetState,
  actionPayload: RegisterQuerySetQueryPayload
) => {
  const {id, query} = actionPayload;
  if (id in state) {
    return;
  }

  state[id] = query;
};
