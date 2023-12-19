import {GeneratedAnswerCitation} from '../../../api/generated-answer/generated-answer-event-payload';
import {generatedAnswerInsightAnalyticsClient} from '../../../features/generated-answer/generated-answer-insight-analytics-actions';
import {GeneratedAnswerState} from '../../../features/generated-answer/generated-answer-state';
import {GeneratedResponseFormat} from '../../../features/generated-answer/generated-response-format';
import {executeSearch} from '../../../features/insight-search/insight-search-actions';
import {InsightEngine} from '../../../insight.index';
import {
  GeneratedAnswer,
  GeneratedAnswerProps,
  buildCoreGeneratedAnswer,
} from '../../core/generated-answer/headless-core-generated-answer';

export type {
  GeneratedAnswerCitation,
  GeneratedResponseFormat,
  GeneratedAnswerState,
  GeneratedAnswer,
  GeneratedAnswerProps,
};

/**
 * Creates an insight `GeneratedAnswer` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `GeneratedAnswer` properties.
 * @returns A `GeneratedAnswer` controller instance.
 */
export function buildGeneratedAnswer(
  engine: InsightEngine,
  props: GeneratedAnswerProps = {}
): GeneratedAnswer {
  const controller = buildCoreGeneratedAnswer(
    engine,
    executeSearch,
    generatedAnswerInsightAnalyticsClient,
    props
  );

  return {
    ...controller,

    get state() {
      return controller.state;
    },
  };
}
