import {isNullOrUndefined} from '@coveo/bueno';
import {createReducer} from '@reduxjs/toolkit';
import {
  registerQuerySetQuery as registerCommerceQuerySetQuery,
  updateQuerySetQuery as updateCommerceQuerySetQuery,
} from '../commerce/query-set/query-set-actions';
import {selectQuerySuggestion as selectCommerceQuerySuggestion} from '../commerce/query-suggest/query-suggest-actions';
import {
  CommerceSearchParameters,
  restoreSearchParameters as commerceRestoreSearchParameters,
} from '../commerce/search-parameters/search-parameters-actions';
import {executeSearch as commerceExecuteSearch} from '../commerce/search/search-actions';
import {change} from '../history/history-actions';
import {selectQuerySuggestion} from '../query-suggest/query-suggest-actions';
import {
  SearchParameters,
  restoreSearchParameters,
} from '../search-parameters/search-parameter-actions';
import {executeSearch} from '../search/search-actions';
import {
  RegisterQuerySetQueryActionCreatorPayload,
  registerQuerySetQuery,
  updateQuerySetQuery,
} from './query-set-actions';
import {getQuerySetInitialState, QuerySetState} from './query-set-state';

export const querySetReducer = createReducer(
  getQuerySetInitialState(),
  (builder) => {
    builder
      .addCase(registerQuerySetQuery, (state, action) =>
        registerQuery(state, action.payload)
      )
      .addCase(registerCommerceQuerySetQuery, (state, action) =>
        registerQuery(state, action.payload)
      )
      .addCase(updateQuerySetQuery, (state, action) => {
        const {id, query} = action.payload;
        updateQuery(state, id, query);
      })
      .addCase(updateCommerceQuerySetQuery, (state, action) => {
        const {id, query} = action.payload;
        updateQuery(state, id, query);
      })
      .addCase(selectQuerySuggestion, (state, action) => {
        const {id, expression} = action.payload;
        updateQuery(state, id, expression);
      })
      .addCase(selectCommerceQuerySuggestion, (state, action) => {
        const {id, expression} = action.payload;
        updateQuery(state, id, expression);
      })
      .addCase(commerceExecuteSearch.fulfilled, (state, action) => {
        const {queryExecuted} = action.payload;
        updateAllQuerySetQuery(state, queryExecuted);
      })
      .addCase(executeSearch.fulfilled, (state, action) => {
        const {queryExecuted} = action.payload;
        updateAllQuerySetQuery(state, queryExecuted);
      })
      .addCase(restoreSearchParameters, handleRestoreSearchParameters)
      .addCase(commerceRestoreSearchParameters, handleRestoreSearchParameters)
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
    payload: SearchParameters | CommerceSearchParameters;
  }
) {
  if (!isNullOrUndefined(action.payload.q)) {
    updateAllQuerySetQuery(state, action.payload.q);
  }
}

function updateAllQuerySetQuery(state: QuerySetState, query: string) {
  Object.keys(state).forEach((id) => (state[id] = query));
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
