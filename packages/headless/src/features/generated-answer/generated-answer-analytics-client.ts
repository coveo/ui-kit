import type {
  CustomAction,
  LegacySearchAction,
} from '../analytics/analytics-utils.js';
import type {GeneratedAnswerFeedback} from './generated-answer-analytics-actions.js';

/**
 * Defines the analytics actions that a `GeneratedAnswer` controller needs to log
 * analytics events for generated answers.
 *
 * This interface is implemented separately for each use case (e.g., `generatedAnswerAnalyticsClient`
 * for Search, `generatedAnswerInsightAnalyticsClient` for Insight), and the appropriate
 * implementation is resolved and passed down at controller-build time.
 *
 * @group Controllers
 * @category GeneratedAnswer
 */
export interface GeneratedAnswerAnalyticsClient {
  /** @deprecated */
  logLikeGeneratedAnswer(): CustomAction;
  logLikeGeneratedAnswer(answerId?: string): CustomAction;
  /** @deprecated */
  logDislikeGeneratedAnswer(): CustomAction;
  logDislikeGeneratedAnswer(answerId?: string): CustomAction;
  logGeneratedAnswerFeedback: (
    feedback: GeneratedAnswerFeedback
  ) => CustomAction;
  /** @deprecated */
  logOpenGeneratedAnswerSource(citationId: string): CustomAction;
  logOpenGeneratedAnswerSource(
    citationId: string,
    answerId?: string
  ): CustomAction;
  logOpenGeneratedAnswerFollowUpSource?(
    citationId: string,
    answerId: string
  ): CustomAction;
  /** @deprecated */
  logHoverCitation(
    citationId: string,
    citationHoverTimeMs: number
  ): CustomAction;
  logHoverCitation(
    citationId: string,
    citationHoverTimeMs: number,
    answerId?: string
  ): CustomAction;
  logGeneratedAnswerShowAnswers: () => CustomAction;
  logGeneratedAnswerHideAnswers: () => CustomAction;
  /** @deprecated */
  logCopyGeneratedAnswer(): CustomAction;
  logCopyGeneratedAnswer(answerId?: string): CustomAction;
  logRetryGeneratedAnswer: () => LegacySearchAction;
  logGeneratedAnswerExpand: () => CustomAction;
  logGeneratedAnswerCollapse: () => CustomAction;
  logGeneratedAnswerStreamEnd(
    answerGenerated: boolean,
    answerId?: string,
    answerTextIsEmpty?: boolean
  ): CustomAction;
}
