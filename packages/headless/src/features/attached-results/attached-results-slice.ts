import {isNullOrUndefined} from '@coveo/bueno';
import {createReducer} from '@reduxjs/toolkit';
import {
  attachResult,
  detachResult,
  goToPage,
  nextPage,
  previousPage,
  setAttachedResults,
} from './attached-results-actions.js';
import {
  type AttachedResult,
  getAttachedResultsInitialState,
} from './attached-results-state.js';
import {attachedResultsApi} from '../../api/attachedResults/attached-results-api.js';
import {
  calculateFirstResult,
  determineCurrentPage,
  determineMaxPage,
} from '../pagination/pagination-slice.js';

const minimumPage = 1;

export const attachedResultsReducer = createReducer(
  getAttachedResultsInitialState(),
  (builder) => {
    builder
      .addCase(setAttachedResults, (state, action) => {
        const {results, loading} = action.payload;

        if ('results' in state && state.results?.length > 0) {
          return;
        }

        state.results = results;
        if (loading) {
          state.loading = loading;
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
      })
      // From here, all the cases are new:
      .addCase(goToPage, (state, action) => {
        const page = action.payload;
        state.firstResult = calculateFirstResult(page, state.numberOfResults);
      })
      .addCase(previousPage, (state) => {
        const page = determineCurrentPage(state);
        const previousPage = Math.max(page - 1, minimumPage);
        state.firstResult = calculateFirstResult(
          previousPage,
          state.numberOfResults
        );
      })
      .addCase(nextPage, (state) => {
        const page = determineCurrentPage(state);
        const maxPage = determineMaxPage(state);
        const nextPage = Math.min(page + 1, maxPage);
        console.log('attachedResultsReducer - nextPage');
        console.log(nextPage);
        console.log(calculateFirstResult(nextPage, state.numberOfResults));
        state.firstResult = calculateFirstResult(
          nextPage,
          state.numberOfResults
        );
      })

      .addMatcher(
        attachedResultsApi.endpoints.getAttachedResults.matchFulfilled,
        (state, action) => {
          state.totalCountFiltered = action.payload.data.totalCountFiltered;
        }
      );
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
