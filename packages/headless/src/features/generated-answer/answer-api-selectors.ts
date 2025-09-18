import {createSelector} from '@reduxjs/toolkit';
import type {StreamAnswerAPIState} from '../../api/knowledge/stream-answer-api-state.js';
import type {SearchRequest} from '../../api/search/search/search-request.js';
import {selectQuery} from '../../features/query/query-selectors.js';

export const selectAnswerTriggerParams = createSelector(
  (state: StreamAnswerAPIState) => selectQuery(state)?.q ?? '',
  (state: StreamAnswerAPIState) => state.search?.requestId ?? '',
  (state: StreamAnswerAPIState) => state.generatedAnswer.cannotAnswer,
  (state: StreamAnswerAPIState) => state.configuration.analytics.analyticsMode,
  (state: StreamAnswerAPIState) => state.search?.searchAction?.actionCause,
  (q, requestId, cannotAnswer, analyticsMode, actionCause) => ({
    q,
    requestId,
    cannotAnswer,
    analyticsMode,
    actionCause,
  })
);

/**
 * If answer params are not available, returns `skipToken`, a special value from RTK Query
 * that tells RTK Query to "skip" running a query or selector until the params are ready.
 *
 * @see https://redux-toolkit.js.org/rtk-query/usage-with-typescript#skipping-queries-with-typescript-using-skiptoken
 */
export const selectAnswerApiQueryParams = createSelector(
  (state: StreamAnswerAPIState): Partial<SearchRequest> | undefined =>
    state.generatedAnswer?.answerApiQueryParams,
  (
    answerApiQueryParams: Partial<SearchRequest> | undefined
  ): Partial<SearchRequest> | undefined => answerApiQueryParams
);
