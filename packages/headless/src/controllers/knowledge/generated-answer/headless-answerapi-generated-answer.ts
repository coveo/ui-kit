import type {GeneratedAnswerStream} from '../../../api/knowledge/generated-answer-stream.js';
import {
  type AnswerEvaluationPOSTParams,
  answerEvaluation,
} from '../../../api/knowledge/post-answer-evaluation.js';
import {triggerSearchRequest} from '../../../api/knowledge/stream-answer-actions.js';
import {
  answerApi,
  fetchAnswer,
  selectAnswer,
} from '../../../api/knowledge/stream-answer-api.js';
import type {StreamAnswerAPIState} from '../../../api/knowledge/stream-answer-api-state.js';
import {warnIfUsingNextAnalyticsModeForServiceFeature} from '../../../app/engine.js';
import type {InsightEngine} from '../../../app/insight-engine/insight-engine.js';
import type {SearchEngine} from '../../../app/search-engine/search-engine.js';
import {
  selectAnswerApiQueryParams,
  selectAnswerTriggerParams,
} from '../../../features/generated-answer/answer-api-selectors.js';
import {
  resetAnswer,
  sendGeneratedAnswerFeedback,
  setCannotAnswer,
  updateAnswerConfigurationId,
} from '../../../features/generated-answer/generated-answer-actions.js';
import type {GeneratedAnswerFeedback} from '../../../features/generated-answer/generated-answer-analytics-actions.js';
import {filterOutDuplicatedCitations} from '../../../features/generated-answer/utils/generated-answer-citation-utils.js';
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

interface AnswerApiGeneratedAnswer
  extends Omit<GeneratedAnswer, 'sendFeedback'> {
  /**
   * Resets the last answer.
   */
  reset(): void;
  /**
   * Sends feedback about why the generated answer was not relevant.
   * @param feedback - The feedback that the end user wishes to send.
   */
  sendFeedback(feedback: GeneratedAnswerFeedback): void;
}

interface AnswerApiGeneratedAnswerProps extends GeneratedAnswerProps {}

interface SearchAPIGeneratedAnswerAnalyticsClient
  extends GeneratedAnswerAnalyticsClient {}

interface ParseEvaluationArgumentsParams {
  feedback: GeneratedAnswerFeedback;
  answerApiState: GeneratedAnswerStream;
  query: string;
}

const parseEvaluationDetails = (
  detail: 'yes' | 'no' | 'unknown'
): boolean | null => {
  if (detail === 'yes') {
    return true;
  }
  if (detail === 'no') {
    return false;
  }
  return null;
};

const parseEvaluationArguments = ({
  answerApiState,
  feedback,
  query,
}: ParseEvaluationArgumentsParams): AnswerEvaluationPOSTParams => ({
  additionalNotes: feedback.details ?? null,
  answer: {
    text: answerApiState.answer!,
    responseId: answerApiState.answerId!,
    format: answerApiState.contentFormat ?? 'text/plain',
  },
  correctAnswerUrl: feedback.documentUrl ?? null,
  details: {
    correctTopic: parseEvaluationDetails(feedback.correctTopic),
    documented: parseEvaluationDetails(feedback.documented),
    hallucinationFree: parseEvaluationDetails(feedback.hallucinationFree),
    readable: parseEvaluationDetails(feedback.readable),
  },
  helpful: feedback.helpful,
  question: query,
});

const subscribeToSearchRequest = (
  engine: SearchEngine<StreamAnswerAPIState>
) => {
  let lastTriggerParams: ReturnType<typeof selectAnswerTriggerParams>;
  const strictListener = () => {
    const state = engine.state;
    const triggerParams = selectAnswerTriggerParams(state);

    if (!lastTriggerParams || triggerParams.q.length === 0) {
      lastTriggerParams = triggerParams;
    }

    if (triggerParams.q.length === 0 && !!triggerParams.cannotAnswer) {
      engine.dispatch(setCannotAnswer(false));
    }

    if (
      triggerParams.q.length === 0 ||
      triggerParams.requestId.length === 0 ||
      triggerParams.requestId === lastTriggerParams.requestId ||
      (triggerParams.analyticsMode === 'next' && !triggerParams.actionCause) // If analytics mode is next, we need to wait for the action cause to be set
    ) {
      return;
    }

    lastTriggerParams = triggerParams;
    engine.dispatch(
      triggerSearchRequest({
        state: state,
        navigatorContext: engine.navigatorContext,
      })
    );
  };

  engine.subscribe(strictListener);
};

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
export function buildAnswerApiGeneratedAnswer(
  engine: SearchEngine | InsightEngine,
  analyticsClient: SearchAPIGeneratedAnswerAnalyticsClient,
  props: AnswerApiGeneratedAnswerProps = {}
): AnswerApiGeneratedAnswer {
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
  engine.dispatch(updateAnswerConfigurationId(props.answerConfigurationId!));

  subscribeToSearchRequest(engine as SearchEngine<StreamAnswerAPIState>);

  return {
    ...controller,
    get state() {
      const answerApiState = selectAnswer(engine.state).data;
      return {
        ...getState().generatedAnswer,
        answer: answerApiState?.answer,
        citations: filterOutDuplicatedCitations(
          answerApiState?.citations ?? []
        ),
        error: {
          message: answerApiState?.error?.message,
          statusCode: answerApiState?.error?.code,
        },
        isLoading: answerApiState?.isLoading ?? false,
        isStreaming: answerApiState?.isStreaming ?? false,
        answerContentFormat: answerApiState?.contentFormat ?? 'text/plain',
        isAnswerGenerated: answerApiState?.generated ?? false,
      };
    },
    retry() {
      const answerApiQueryParams = selectAnswerApiQueryParams(getState());
      engine.dispatch(fetchAnswer(answerApiQueryParams));
    },
    reset() {
      engine.dispatch(resetAnswer());
    },
    async sendFeedback(feedback) {
      const args = parseEvaluationArguments({
        query: getState().query.q,
        feedback,
        answerApiState: selectAnswer(engine.state).data!,
      });
      engine.dispatch(answerEvaluation.endpoints.post.initiate(args));
      engine.dispatch(sendGeneratedAnswerFeedback());
    },
  };
}

function loadAnswerApiReducers(
  engine: SearchEngine | InsightEngine
): engine is SearchEngine<
  GeneratedAnswerSection &
    QuerySection & {answer: ReturnType<typeof answerApi.reducer>}
> {
  engine.addReducers({[answerApi.reducerPath]: answerApi.reducer, query});
  return true;
}
