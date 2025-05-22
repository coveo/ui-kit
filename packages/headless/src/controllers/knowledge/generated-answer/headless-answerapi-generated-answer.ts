import {
  answerEvaluation,
  AnswerEvaluationPOSTParams,
} from '../../../api/knowledge/post-answer-evaluation';
import {
  answerApi,
  fetchAnswer,
  GeneratedAnswerStream,
  selectAnswer,
  selectAnswerTriggerParams,
  StateNeededByAnswerAPI,
} from '../../../api/knowledge/stream-answer-api';
import {SearchEngine} from '../../../app/search-engine/search-engine';
import {
  resetAnswer,
  sendGeneratedAnswerFeedback,
  updateAnswerConfigurationId,
} from '../../../features/generated-answer/generated-answer-actions';
import {GeneratedAnswerFeedbackV2} from '../../../features/generated-answer/generated-answer-analytics-actions';
import {queryReducer as query} from '../../../features/query/query-slice';
import {
  GeneratedAnswerSection,
  QuerySection,
} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {
  buildCoreGeneratedAnswer,
  GeneratedAnswer,
  GeneratedAnswerAnalyticsClient,
  GeneratedAnswerProps,
  GeneratedResponseFormat,
} from '../../core/generated-answer/headless-core-generated-answer';

export interface AnswerApiGeneratedAnswer
  extends Omit<GeneratedAnswer, 'sendFeedback'> {
  /**
   * Resets the last answer.
   */
  reset(): void;
  /**
   * Sends feedback about why the generated answer was not relevant.
   * @param feedback - The feedback that the end user wishes to send.
   */
  sendFeedback(feedback: GeneratedAnswerFeedbackV2): void;
}

interface AnswerApiGeneratedAnswerProps extends GeneratedAnswerProps {}

export interface SearchAPIGeneratedAnswerAnalyticsClient
  extends GeneratedAnswerAnalyticsClient {}

interface ParseEvaluationArgumentsParams {
  feedback: GeneratedAnswerFeedbackV2;
  answerApiState: GeneratedAnswerStream;
  query: string;
}

const parseEvaluationDetails = (
  detail: 'yes' | 'no' | 'unknown'
): Boolean | null => {
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
  engine: SearchEngine<StateNeededByAnswerAPI>
) => {
  let lastTriggerParams: ReturnType<typeof selectAnswerTriggerParams>;
  const strictListener = () => {
    const state = engine.state;
    const triggerParams = selectAnswerTriggerParams(state);
    if (triggerParams.q.length === 0 || triggerParams.requestId.length === 0) {
      return;
    }
    if (triggerParams?.requestId === lastTriggerParams?.requestId) {
      return;
    }
    lastTriggerParams = triggerParams;
    engine.dispatch(resetAnswer());
    engine.dispatch(fetchAnswer(state, engine.navigatorContext));
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
  engine: SearchEngine,
  analyticsClient: SearchAPIGeneratedAnswerAnalyticsClient,
  props: AnswerApiGeneratedAnswerProps = {}
): AnswerApiGeneratedAnswer {
  if (!loadAnswerApiReducers(engine)) {
    throw loadReducerError;
  }

  const {rephrase: coreRephrase, ...controller} = buildCoreGeneratedAnswer(
    engine,
    analyticsClient,
    props
  );
  const getState = () => engine.state;

  engine.dispatch(updateAnswerConfigurationId(props.answerConfigurationId!));

  subscribeToSearchRequest(engine as SearchEngine<StateNeededByAnswerAPI>);

  return {
    ...controller,
    get state() {
      const answerApiState = selectAnswer(
        engine.state,
        engine.navigatorContext
      ).data;
      return {
        ...getState().generatedAnswer,
        answer: answerApiState?.answer,
        citations: answerApiState?.citations ?? [],
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
    rephrase(responseFormat: GeneratedResponseFormat) {
      coreRephrase(responseFormat);
      engine.dispatch(fetchAnswer(getState(), engine.navigatorContext));
    },
    retry() {
      engine.dispatch(fetchAnswer(getState(), engine.navigatorContext));
    },
    reset() {
      engine.dispatch(resetAnswer());
    },
    async sendFeedback(feedback) {
      const args = parseEvaluationArguments({
        query: getState().query.q,
        feedback,
        answerApiState: selectAnswer(engine.state, engine.navigatorContext)
          .data!,
      });
      engine.dispatch(answerEvaluation.endpoints.post.initiate(args));
      engine.dispatch(sendGeneratedAnswerFeedback());
    },
  };
}

function loadAnswerApiReducers(
  engine: SearchEngine
): engine is SearchEngine<
  GeneratedAnswerSection &
    QuerySection & {answer: ReturnType<typeof answerApi.reducer>}
> {
  engine.addReducers({[answerApi.reducerPath]: answerApi.reducer, query});
  return true;
}
