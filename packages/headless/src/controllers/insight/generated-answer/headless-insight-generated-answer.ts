import {GeneratedAnswerCitation} from '../../../api/generated-answer/generated-answer-event-payload';
import {InsightEngine} from '../../../app/insight-engine/insight-engine';
import {generatedAnswerInsightAnalyticsClient} from '../../../features/generated-answer/generated-answer-insight-analytics-actions';
import {GeneratedAnswerState} from '../../../features/generated-answer/generated-answer-state';
import {GeneratedResponseFormat} from '../../../features/generated-answer/generated-response-format';
import {executeSearch} from '../../../features/insight-search/insight-search-actions';
import {
  GeneratedAnswer,
  GeneratedAnswerProps,
} from '../../core/generated-answer/headless-core-generated-answer';
import {buildSearchAPIGeneratedAnswer} from '../../core/generated-answer/headless-searchapi-generated-answer';

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
  const {dispatch} = engine;
  const controller = buildSearchAPIGeneratedAnswer(
    engine,
    generatedAnswerInsightAnalyticsClient,
    props
  );

  return {
    ...controller,

    get state() {
      return controller.state;
    },

    retry() {
      dispatch(
        executeSearch({
          legacy:
            generatedAnswerInsightAnalyticsClient.logRetryGeneratedAnswer(),
        })
      );
    },

    rephrase(responseFormat: GeneratedResponseFormat) {
      controller.rephrase(responseFormat);
      dispatch(
        executeSearch({
          legacy:
            generatedAnswerInsightAnalyticsClient.logRephraseGeneratedAnswer(
              responseFormat
            ),
        })
      );
    },
  };
}
