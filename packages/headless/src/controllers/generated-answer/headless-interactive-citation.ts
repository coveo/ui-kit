import type {FrankensteinEngine} from '../../app/frankenstein-engine/frankenstein-engine.js';
import {ensureSearchEngine} from '../../app/frankenstein-engine/frankenstein-engine-utils.js';
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
  InteractiveCitationOptions,
  InteractiveCitationProps,
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
  engine: SearchEngine | FrankensteinEngine,
  props: InteractiveCitationProps
): InteractiveCitation {
  return buildInteractiveCitationCore(
    ensureSearchEngine(engine),
    generatedAnswerAnalyticsClient,
    props
  );
}
