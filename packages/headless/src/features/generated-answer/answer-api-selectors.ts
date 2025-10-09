import {createSelector} from '@reduxjs/toolkit';
import {type SkipToken, skipToken} from '@reduxjs/toolkit/query';
import {selectQuery} from '../../features/query/query-selectors.js';
import type {ConfigurationState} from '../configuration/configuration-state.js';
import type {QueryState} from '../query/query-state.js';
import type {SearchState} from '../search/search-state.js';
import type {AnswerApiQueryParams} from './generated-answer-request.js';
import type {GeneratedAnswerState} from './generated-answer-state.js';

type AnswerTriggerParams = {
  q: string | undefined;
  requestId: string;
  cannotAnswer: boolean;
  analyticsMode: string;
  actionCause: string | undefined;
};

export const selectAnswerTriggerParams: (state: {
  query?: QueryState;
  search: SearchState;
  generatedAnswer: GeneratedAnswerState;
  configuration: ConfigurationState;
}) => AnswerTriggerParams = createSelector(
  (state: {query?: QueryState}) => selectQuery(state)?.q,
  (state: {search: SearchState}) => state.search.requestId,
  (state: {generatedAnswer: GeneratedAnswerState}) =>
    state.generatedAnswer.cannotAnswer,
  (state: {configuration: ConfigurationState}) =>
    state.configuration.analytics.analyticsMode,
  (state: {search: SearchState}) => state.search.searchAction?.actionCause,
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
export const selectAnswerApiQueryParams: (state: {
  generatedAnswer?: {answerApiQueryParams?: AnswerApiQueryParams};
}) => AnswerApiQueryParams | SkipToken = createSelector(
  (state: {generatedAnswer?: {answerApiQueryParams?: AnswerApiQueryParams}}) =>
    state.generatedAnswer?.answerApiQueryParams,
  (answerApiQueryParams) => answerApiQueryParams ?? skipToken
);
