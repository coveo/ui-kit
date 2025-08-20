import {createSelector} from '@reduxjs/toolkit';
import {selectQuery} from '../../features/query/query-selectors.js';

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
