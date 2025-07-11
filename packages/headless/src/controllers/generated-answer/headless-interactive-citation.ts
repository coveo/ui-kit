import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import {generatedAnswerAnalyticsClient} from '../../features/generated-answer/generated-answer-analytics-actions.js';
import {
  buildInteractiveCitationCore,
  type InteractiveCitation,
  type InteractiveCitationOptions,
  type InteractiveCitationProps,
} from '../core/generated-answer/headless-core-interactive-citation.js';

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
 *
 * @group Controllers
 * @category InteractiveCitation
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
