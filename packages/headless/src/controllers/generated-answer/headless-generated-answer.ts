import type {GeneratedAnswerCitation} from '../../api/generated-answer/generated-answer-event-payload.js';
import {warnIfUsingNextAnalyticsModeForServiceFeature} from '../../app/engine.js';
import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import {generatedAnswerAnalyticsClient} from '../../features/generated-answer/generated-answer-analytics-actions.js';
import type {GeneratedAnswerState} from '../../features/generated-answer/generated-answer-state.js';
import type {GeneratedResponseFormat} from '../../features/generated-answer/generated-response-format.js';
import type {
  GeneratedAnswer,
  GeneratedAnswerProps,
  GeneratedAnswerPropsInitialState,
} from '../core/generated-answer/headless-core-generated-answer.js';
import {buildSearchAPIGeneratedAnswer} from '../core/generated-answer/headless-searchapi-generated-answer.js';
import {buildAnswerApiGeneratedAnswer} from '../knowledge/generated-answer/headless-answerapi-generated-answer.js';

export type {
  GeneratedAnswerCitation,
  GeneratedResponseFormat,
  GeneratedAnswerState,
  GeneratedAnswer,
  GeneratedAnswerProps,
  GeneratedAnswerPropsInitialState,
};

/**
 * Creates a `GeneratedAnswer` controller instance.

 * @param engine - The headless engine.
 * @param props - The configurable `GeneratedAnswer` properties.
 * @returns A `GeneratedAnswer` controller instance.
 *
 * @group Controllers
 * @category GeneratedAnswer
 */
export function buildGeneratedAnswer(
  engine: SearchEngine,
  props: GeneratedAnswerProps = {}
): GeneratedAnswer {
  warnIfUsingNextAnalyticsModeForServiceFeature(
    engine.state.configuration.analytics.analyticsMode
  );
  const controller = props.answerConfigurationId
    ? buildAnswerApiGeneratedAnswer(
        engine,
        generatedAnswerAnalyticsClient,
        props
      )
    : buildSearchAPIGeneratedAnswer(
        engine,
        generatedAnswerAnalyticsClient,
        props
      );

  return {
    ...controller,

    get state() {
      return controller.state;
    },
  };
}
