import type {SearchAppState} from '../../state/search-app-state.js';
import {
  logOpenGeneratedAnswerFollowUpSource,
  logOpenGeneratedAnswerSource,
} from '../../features/generated-answer/generated-answer-analytics-actions.js';
import {generativeQuestionAnsweringIdSelector} from '../../features/generated-answer/generated-answer-selectors.js';
import type {InteractiveCitationAnalyticsClient} from '../core/generated-answer/headless-core-interactive-citation.js';

export function buildInteractiveCitationAnalyticsClient(
  getState: () => Partial<SearchAppState>
): InteractiveCitationAnalyticsClient {
  return {
    logCitationOpen(citationId: string, answerId?: string) {
      const headAnswerId = generativeQuestionAnsweringIdSelector(getState());

      if (
        answerId !== undefined &&
        headAnswerId !== undefined &&
        answerId !== headAnswerId
      ) {
        return logOpenGeneratedAnswerFollowUpSource(citationId, answerId);
      }
      return answerId !== undefined
        ? logOpenGeneratedAnswerSource(citationId, answerId)
        : logOpenGeneratedAnswerSource(citationId);
    },
  };
}
