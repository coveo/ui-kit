import {isNullOrUndefined} from '@coveo/bueno';
import {createReducer} from '@reduxjs/toolkit';
import {change} from '../history/history-actions.js';
import {selectQuerySuggestion} from '../query-suggest/query-suggest-actions.js';
import {executeSearch} from '../search/search-actions.js';
import {
  restoreSearchParameters,
  type SearchParameters,
} from '../search-parameters/search-parameter-actions.js';
import {
  type RegisterQuerySetQueryActionCreatorPayload,
  registerQuerySetQuery,
  updateQuerySetQuery,
} from './query-set-actions.js';
import {
  getQuerySetInitialState,
  type QuerySetState,
} from './query-set-state.js';

export const querySetReducer = createReducer(
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
      .addCase(restoreSearchParameters, handleRestoreSearchParameters)
      .addCase(change.fulfilled, (state, action) => {
        if (!action.payload) {
          return;
        }

        for (const [id, query] of Object.entries(action.payload.querySet)) {
          updateQuery(state, id, query);
        }
      });
  }
);

function handleRestoreSearchParameters(
  state: QuerySetState,
  action: {
    payload: SearchParameters;
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
  actionPayload: RegisterQuerySetQueryActionCreatorPayload
) => {
  const {id, query} = actionPayload;
  if (id in state) {
    return;
  }

  state[id] = query;
};
