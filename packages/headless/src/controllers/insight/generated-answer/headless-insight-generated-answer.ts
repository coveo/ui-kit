import {GeneratedAnswerCitation} from '../../../api/generated-answer/generated-answer-event-payload.js';
import {InsightEngine} from '../../../app/insight-engine/insight-engine.js';
import {retryGeneratedAnswer} from '../../../features/generated-answer/generated-answer-analytics-actions.js';
import {generatedAnswerInsightAnalyticsClient} from '../../../features/generated-answer/generated-answer-insight-analytics-actions.js';
import {GeneratedAnswerState} from '../../../features/generated-answer/generated-answer-state.js';
import {GeneratedResponseFormat} from '../../../features/generated-answer/generated-response-format.js';
import {executeSearch} from '../../../features/insight-search/insight-search-actions.js';
import {
  GeneratedAnswer,
  GeneratedAnswerProps,
} from '../../core/generated-answer/headless-core-generated-answer.js';
import {buildSearchAPIGeneratedAnswer} from '../../core/generated-answer/headless-searchapi-generated-answer.js';
import {buildAnswerApiGeneratedAnswer} from '../../knowledge/generated-answer/headless-answerapi-generated-answer.js';

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
  const controller = props.answerConfigurationId
    ? buildAnswerApiGeneratedAnswer(
        engine,
        generatedAnswerInsightAnalyticsClient,
        props
      )
    : buildSearchAPIGeneratedAnswer(
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
          next: retryGeneratedAnswer(),
        })
      );
    },
  };
}
