import {GeneratedAnswerCitation} from '../../api/generated-answer/generated-answer-event-payload';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {generatedAnswerAnalyticsClient} from '../../features/generated-answer/generated-answer-analytics-actions';
import {GeneratedAnswerState} from '../../features/generated-answer/generated-answer-state';
import {GeneratedResponseFormat} from '../../features/generated-answer/generated-response-format';
import {
  GeneratedAnswer,
  GeneratedAnswerProps,
} from '../core/generated-answer/headless-core-generated-answer';
import {buildSearchAPIGeneratedAnswer} from '../core/generated-answer/headless-searchapi-generated-answer';
// import {buildSearchAPIGeneratedAnswer} from '../core/generated-answer/headless-searchapi-generated-answer';
// import {buildSearchAPIGeneratedAnswer} from '../core/generated-answer/headless-searchapi-generated-answer';
import {
  buildKnowledgeGeneratedAnswer,
  KnowledgeEngine,
} from '../knowledge/generatedAnswer/headless-knowledge-generated-answer';

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
  engine: SearchEngine & KnowledgeEngine, // TODO: types
  props: GeneratedAnswerProps = {}
): GeneratedAnswer {
  const hasConfigId = true;

  const controller = hasConfigId
    ? buildKnowledgeGeneratedAnswer(
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
