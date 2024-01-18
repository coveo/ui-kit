import {SearchEngine} from '../../app/search-engine/search-engine';
import {generatedAnswerAnalyticsClient} from '../../features/generated-answer/generated-answer-analytics-actions';
import {
  InteractiveCitation,
  InteractiveCitationOptions,
  InteractiveCitationProps,
  buildInteractiveCitationCore,
} from '../core/generated-answer/headless-core-interactive-citation';

export type {
  InteractiveCitation,
  InteractiveCitationProps,
  InteractiveCitationOptions,
};

/**
 * Creates an `InteractiveCitation` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `InteractiveCitation` properties.
 * @returns An `InteractiveCitation` controller instance.
 */
export function buildInteractiveCitation(
  engine: SearchEngine,
  props: InteractiveCitationProps
): InteractiveCitation {
  return buildInteractiveCitationCore(
    engine,
    generatedAnswerAnalyticsClient,
    props
  );
}
