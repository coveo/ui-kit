import {isNullOrUndefined} from '@coveo/bueno';
import {createReducer} from '@reduxjs/toolkit';
import {
  setAttachedResults,
  attachResult,
  detachResult,
} from './attached-results-actions.js';
import {
  AttachedResult,
  getAttachedResultsInitialState,
} from './attached-results-state.js';

export const attachedResultsReducer = createReducer(
  getAttachedResultsInitialState(),
  (builder) => {
    builder
      .addCase(setAttachedResults, (state, action) => {
        const {results, loading} = action.payload;

        if ('results' in state && state['results']?.length > 0) {
          return;
        }

        state['results'] = results;
        if (loading) {
          state['loading'] = loading;
        }
      })
      .addCase(attachResult, (state, action) => {
        if (
          !isNullOrUndefined(action.payload.result.permanentId) ||
          !isNullOrUndefined(action.payload.result.uriHash)
        ) {
          state.results = [...state.results, action.payload.result];
        }
      })
      .addCase(detachResult, (state, action) => {
        state.results = state.results.filter((result) =>
          attachedResultsMatchIds(result, action.payload.result)
        );
      });
  }
);

const attachedResultsMatchIds = (
  result1: AttachedResult,
  result2: AttachedResult
) => {
  const isPermanentIdEqual =
    !isNullOrUndefined(result1.permanentId) &&
    result1?.permanentId === result2?.permanentId;
  const isUriHashEqual =
    !isNullOrUndefined(result1.uriHash) &&
    result1?.uriHash === result2?.uriHash;
  const isCaseIdEqual = result1.caseId === result2.caseId;
  return !isCaseIdEqual || (!isPermanentIdEqual && !isUriHashEqual);
};
