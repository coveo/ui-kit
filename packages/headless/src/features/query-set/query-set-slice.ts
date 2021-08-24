import {isNullOrUndefined} from '@coveo/bueno';
import {createReducer} from '@reduxjs/toolkit';
import {registerQuerySetQuery, updateQuerySetQuery} from './query-set-actions';
import {selectQuerySuggestion} from '../query-suggest/query-suggest-actions';
import {change} from '../history/history-actions';
import {executeSearch} from '../search/search-actions';
import {getQuerySetInitialState, QuerySetState} from './query-set-state';
import {restoreSearchParameters} from '../search-parameters/search-parameter-actions';

export const querySetReducer = createReducer(
  getQuerySetInitialState(),
  (builder) => {
    builder
      .addCase(registerQuerySetQuery, (state, action) => {
        const {id, query} = action.payload;

        if (id in state) {
          return;
        }

        state[id] = query;
      })
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
      .addCase(restoreSearchParameters, (state, action) => {
        if (!isNullOrUndefined(action.payload.q)) {
          updateAllQuerySetQuery(state, action.payload.q);
        }
      })
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

function updateAllQuerySetQuery(state: QuerySetState, query: string) {
  Object.keys(state).forEach((id) => (state[id] = query));
}

const updateQuery = (state: QuerySetState, id: string, query: string) => {
  if (id in state) {
    state[id] = query;
  }
};
