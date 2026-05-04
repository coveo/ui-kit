import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import {generatedAnswerAnalyticsClient} from '../../features/generated-answer/generated-answer-analytics-actions.js';
import {
  buildInteractiveGeneratedAnswerInlineLinkCore,
  type InteractiveGeneratedAnswerInlineLink,
  type InteractiveGeneratedAnswerInlineLinkOptions,
  type InteractiveGeneratedAnswerInlineLinkProps,
} from '../core/generated-answer/headless-core-interactive-generated-answer-inline-link.js';

export type {
  InteractiveGeneratedAnswerInlineLink,
  InteractiveGeneratedAnswerInlineLinkOptions,
  InteractiveGeneratedAnswerInlineLinkProps,
};

/**
 * Creates an `InteractiveGeneratedAnswerInlineLink` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `InteractiveGeneratedAnswerInlineLink`
 * properties.
 * @returns An `InteractiveGeneratedAnswerInlineLink` controller instance.
 *
 * @group Controllers
 * @category InteractiveGeneratedAnswerInlineLink
 */
export function buildInteractiveGeneratedAnswerInlineLink(
  engine: SearchEngine,
  props: InteractiveGeneratedAnswerInlineLinkProps
): InteractiveGeneratedAnswerInlineLink {
  return buildInteractiveGeneratedAnswerInlineLinkCore(
    engine,
    generatedAnswerAnalyticsClient,
    props
  );
}
