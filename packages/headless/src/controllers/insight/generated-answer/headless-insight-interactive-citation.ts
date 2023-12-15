import {InsightEngine} from '../../../app/insight-engine/insight-engine';
import {logOpenGeneratedAnswerSource} from '../../../features/generated-answer/generated-answer-insight-analytics-actions';
import {
  InteractiveCitation,
  InteractiveCitationOptions,
  InteractiveCitationProps,
  buildInteractiveCitationCore,
} from '../../core/generated-answer/headless-core-interactive-citation';

export type {
  InteractiveCitation,
  InteractiveCitationProps,
  InteractiveCitationOptions,
};

/**
 * Creates an insight `InteractiveCitation` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `InteractiveCitation` properties.
 * @returns An `InteractiveCitation` controller instance.
 */
export function buildInteractiveCitation(
  engine: InsightEngine,
  props: InteractiveCitationProps
): InteractiveCitation {
  return buildInteractiveCitationCore(
    engine,
    {logOpenGeneratedAnswerSource},
    props
  );
}
