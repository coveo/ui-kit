import {createSelector} from '@reduxjs/toolkit';
import {skipToken} from '@reduxjs/toolkit/query';
import type {AnswerGenerationApiState} from '../../api/knowledge/answer-generation/answer-generation-api-state.js';
import type {AnswerEndpointArgs} from '../../api/knowledge/answer-generation/endpoints/answer/answer-endpoint.js';
import {selectQuery} from '../../features/query/query-selectors.js';
import {headAnswerStrategy} from './head-answer-strategy.js';

export const selectAnswerTriggerParams = createSelector(
  (state) => selectQuery(state)?.q,
  (state) => state.search.requestId,
  (state) => state.generatedAnswer.cannotAnswer,
  (state) => state.configuration.analytics.analyticsMode,
  (state) => state.search.searchAction?.actionCause,
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
  (state) => state.generatedAnswer?.answerApiQueryParams,
  (answerApiQueryParams) => answerApiQueryParams ?? skipToken
);

export const selectHeadAnswerArgs = (
  state: AnswerGenerationApiState
): AnswerEndpointArgs => {
  return {
    strategy: headAnswerStrategy,
    params: selectAnswerApiQueryParams(state),
  };
};
