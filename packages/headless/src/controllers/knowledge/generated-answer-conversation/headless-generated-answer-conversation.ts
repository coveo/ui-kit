import {answerGenerationApi} from '../../../api/knowledge/answer-generation/answer-generation-api.js';
import {warnIfUsingNextAnalyticsModeForServiceFeature} from '../../../app/engine.js';
import type {InsightEngine} from '../../../app/insight-engine/insight-engine.js';
import type {SearchEngine} from '../../../app/search-engine/search-engine.js';
import {
  resetAnswer,
  updateAnswerConfigurationId,
} from '../../../features/generated-answer/generated-answer-actions.js';
import {
  generateFollowUpAnswer,
  generateHeadAnswer,
} from '../../../features/generated-answer/generated-answer-conversation-actions.js';
import {queryReducer as query} from '../../../features/query/query-slice.js';
import type {
  GeneratedAnswerSection,
  QuerySection,
} from '../../../state/state-sections.js';
import {loadReducerError} from '../../../utils/errors.js';
import {
  buildCoreGeneratedAnswer,
  type GeneratedAnswer,
  type GeneratedAnswerAnalyticsClient,
  type GeneratedAnswerProps,
} from '../../core/generated-answer/headless-core-generated-answer.js';

interface GeneratedAnswerConversation extends GeneratedAnswer {
  /**
   * Resets the last answer.
   */
  reset(): void;
  /**
   * Asks a follow-up question.
   * @param question - The follow-up question to ask.
   */
  ask(question: string): void;
}

interface AnswerApiGeneratedAnswerProps extends GeneratedAnswerProps {}

interface SearchAPIGeneratedAnswerAnalyticsClient
  extends GeneratedAnswerAnalyticsClient {}

/**
 *
 * @internal
 *
 * Creates a `AnswerApiGeneratedAnswer` controller instance using the Answer API stream pattern.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `AnswerApiGeneratedAnswer` properties.
 * @returns A `AnswerApiGeneratedAnswer` controller instance.
 */
export function buildGeneratedAnswerConversation(
  engine: SearchEngine | InsightEngine,
  analyticsClient: SearchAPIGeneratedAnswerAnalyticsClient,
  props: AnswerApiGeneratedAnswerProps = {}
): GeneratedAnswerConversation {
  if (!loadAnswerApiReducers(engine)) {
    throw loadReducerError;
  }
  warnIfUsingNextAnalyticsModeForServiceFeature(
    engine.state.configuration.analytics.analyticsMode
  );

  const {...controller} = buildCoreGeneratedAnswer(
    engine,
    analyticsClient,
    props
  );
  const getState = () => engine.state;
  engine.dispatch(updateAnswerConfigurationId(props.agentId!));

  return {
    ...controller,
    get state() {
      const state = getState().generatedAnswer;
      return state;
    },
    retry() {
      engine.dispatch(generateHeadAnswer());
    },
    reset() {
      engine.dispatch(resetAnswer());
    },
    async sendFeedback(feedback) {
      engine.dispatch(analyticsClient.logGeneratedAnswerFeedback(feedback));
      // const args = parseEvaluationArguments({
      //   query: getState().query.q,
      //   feedback,
      //   answerApiState: selectAnswer(engine.state).data!,
      // });
      // engine.dispatch(answerEvaluation.endpoints.post.initiate(args));
      // engine.dispatch(sendGeneratedAnswerFeedback());
    },
    ask(question: string) {
      engine.dispatch(generateFollowUpAnswer(question));
    },
  };
}

function loadAnswerApiReducers(
  engine: SearchEngine | InsightEngine
): engine is SearchEngine<
  GeneratedAnswerSection &
    QuerySection & {
      answerGenerationApi: ReturnType<typeof answerGenerationApi.reducer>;
    }
> {
  engine.addReducers({
    [answerGenerationApi.reducerPath]: answerGenerationApi.reducer,
    query,
  });
  return true;
}
