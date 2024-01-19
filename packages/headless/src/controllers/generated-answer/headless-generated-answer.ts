import {GeneratedAnswerCitation} from '../../api/generated-answer/generated-answer-event-payload';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {generatedAnswerAnalyticsClient} from '../../features/generated-answer/generated-answer-analytics-actions';
import {GeneratedAnswerState} from '../../features/generated-answer/generated-answer-state';
import {GeneratedResponseFormat} from '../../features/generated-answer/generated-response-format';
import {executeSearch} from '../../features/search/search-actions';
import {
  GeneratedAnswer,
  GeneratedAnswerProps,
  buildCoreGeneratedAnswer,
} from '../core/generated-answer/headless-core-generated-answer';

export type {
  GeneratedAnswerCitation,
  GeneratedResponseFormat,
  GeneratedAnswerState,
  GeneratedAnswer,
  GeneratedAnswerProps,
};

/**
 * Creates a `GeneratedAnswer` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `GeneratedAnswer` properties.
 * @returns A `GeneratedAnswer` controller instance.
 */
export function buildGeneratedAnswer(
  engine: SearchEngine,
  props: GeneratedAnswerProps = {}
): GeneratedAnswer {
  const {dispatch} = engine;
  const controller = buildCoreGeneratedAnswer(
    engine,
    generatedAnswerAnalyticsClient,
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
          legacy: generatedAnswerAnalyticsClient.logRetryGeneratedAnswer(),
        })
      );
    },

    rephrase(responseFormat: GeneratedResponseFormat) {
      controller.rephrase(responseFormat);
      dispatch(
        executeSearch({
          legacy:
            generatedAnswerAnalyticsClient.logRephraseGeneratedAnswer(
              responseFormat
            ),
        })
      );
    },
  };
}
