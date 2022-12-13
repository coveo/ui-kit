import {isNullOrUndefined} from '@coveo/bueno';
import {createReducer} from '@reduxjs/toolkit';
import {
  setAttachedResults,
  attachResult,
  detachResult,
} from './attached-results-actions';
import {getAttachedResultsInitialState} from './attached-results-state';

export const attachToCaseReducer = createReducer(
  getAttachedResultsInitialState(),

  (builder) => {
    builder
      .addCase(setAttachedResults, (state, action) => {
        const {results: attachedResults, message} = action.payload;

        if ('attachedResults' in state && state['results']?.length > 0) {
          return;
        }

        state['results'] = attachedResults;
        state['message'] = message;
      })
      .addCase(attachResult, (state, action) => {
        if (
          !isNullOrUndefined(action.payload.result.permanentId) ||
          !isNullOrUndefined(action.payload.result.uriHash)
        ) {
          state.results = [action.payload.result, ...state.results];
        }
      })
      .addCase(detachResult, (state, action) => {
        state.results = state.results.filter((result) => {
          const isPermanentIdEqual =
            result?.permanentId !== undefined &&
            result?.permanentId === action.payload?.result?.permanentId;
          const isUriHashEqual =
            result?.uriHash !== undefined &&
            result?.uriHash === action.payload?.result?.uriHash;
          const isCaseIdEqual = result.caseId === action.payload.result.caseId;
          return !isCaseIdEqual || (!isPermanentIdEqual && !isUriHashEqual);
        });
      });
  }
);
