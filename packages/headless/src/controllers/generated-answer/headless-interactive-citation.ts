import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import {
  buildInteractiveCitationCore,
  type InteractiveCitation,
  type InteractiveCitationOptions,
  type InteractiveCitationProps,
} from '../core/generated-answer/headless-core-interactive-citation.js';
import {buildInteractiveCitationAnalyticsClient} from './interactive-citation-analytics-client.js';

export type {InteractiveCitation, InteractiveCitationOptions, InteractiveCitationProps};

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
    buildInteractiveCitationAnalyticsClient(() => engine.state),
    props
  );
}
