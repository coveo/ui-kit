import type {
  CustomAction,
  InsightAction,
} from '../analytics/analytics-utils.js';

/**
 * Analytics client for the answer generation lifecycle events.
 *
 * These events are dispatched from the answer generation machinery (the answer
 * generation listener middleware and the answer/follow-up streaming strategies)
 * rather than from the controller itself. Injecting this client allows each use
 * case (search, insight, ...) to log the generation lifecycle with its own
 * analytics implementation instead of being hardcoded to a single use case.
 */
export interface AnswerGenerationAnalyticsClient {
  logGeneratedAnswerStreamEnd(
    answerGenerated: boolean,
    answerId?: string,
    answerTextIsEmpty?: boolean
  ): CustomAction | InsightAction;
  logGeneratedAnswerResponseLinked(
    answerId?: string
  ): CustomAction | InsightAction;
}
