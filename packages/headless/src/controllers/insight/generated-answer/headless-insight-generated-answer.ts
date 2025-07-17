import type {InsightEngine} from '../../../app/insight-engine/insight-engine.js';
import {retryGeneratedAnswer} from '../../../features/generated-answer/generated-answer-analytics-actions.js';
import {generatedAnswerInsightAnalyticsClient} from '../../../features/generated-answer/generated-answer-insight-analytics-actions.js';
import type {GeneratedAnswerState} from '../../../features/generated-answer/generated-answer-state.js';
import {executeSearch} from '../../../features/insight-search/insight-search-actions.js';
import type {
  GeneratedAnswer,
  GeneratedAnswerProps,
} from '../../core/generated-answer/headless-core-generated-answer.js';
import {buildSearchAPIGeneratedAnswer} from '../../core/generated-answer/headless-searchapi-generated-answer.js';
import {buildAnswerApiGeneratedAnswer} from '../../knowledge/generated-answer/headless-answerapi-generated-answer.js';

export type {GeneratedAnswerState, GeneratedAnswer, GeneratedAnswerProps};

/**
 * Creates an insight `GeneratedAnswer` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `GeneratedAnswer` properties.
 * @returns A `GeneratedAnswer` controller instance.
 *
 * @group Controllers
 * @category GeneratedAnswer
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
