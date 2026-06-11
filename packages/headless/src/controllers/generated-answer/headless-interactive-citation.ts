import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import {
  logOpenGeneratedAnswerFollowUpSource,
  logOpenGeneratedAnswerSource,
} from '../../features/generated-answer/generated-answer-analytics-actions.js';
import {generativeQuestionAnsweringIdSelector} from '../../features/generated-answer/generated-answer-selectors.js';
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
  engine: SearchEngine,
  props: InteractiveCitationProps
): InteractiveCitation {
  return buildInteractiveCitationCore(
    engine,
    {
      logCitationOpen(citationId: string, answerId?: string) {
        const headAnswerId = generativeQuestionAnsweringIdSelector(
          engine.state
        );

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
    },
    props
  );
}
