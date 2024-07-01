import {
  answerApi,
  fetchAnswer,
  selectAnswer,
} from '../../../api/knowledge/stream-answer-api';
import {CoreEngine} from '../../../app/engine';
import {resetAnswer} from '../../../features/generated-answer/generated-answer-actions';
import {
  DebugSection,
  GeneratedAnswerSection,
  SearchSection,
} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {
  buildCoreGeneratedAnswer,
  GeneratedAnswer,
  GeneratedAnswerAnalyticsClient,
  GeneratedAnswerProps,
  GeneratedResponseFormat,
} from '../../core/generated-answer/headless-core-generated-answer';

export interface KnowledgeGeneratedAnswer extends GeneratedAnswer {
  /**
   * use the last query to request the generation of an answer.
   */
  requestGeneratedAnswer(): void;
  /**
   * resets the last answer.
   */
  reset(): void;
}
export interface KnowledgeGeneratedAnswerProps extends GeneratedAnswerProps {}

export interface SearchAPIGeneratedAnswerAnalyticsClient
  extends GeneratedAnswerAnalyticsClient {}

export type KnowledgeEngine = CoreEngine<
  GeneratedAnswerSection &
    SearchSection &
    DebugSection & {answer: ReturnType<typeof answerApi.reducer>}
>;

/**
 * Creates a `GeneratedAnswer` controller instance using the search api stream pattern.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `GeneratedAnswer` properties.
 * @returns A `GeneratedAnswer` controller instance.
 */
export function buildKnowledgeGeneratedAnswer(
  engine: KnowledgeEngine,
  analyticsClient: SearchAPIGeneratedAnswerAnalyticsClient,
  props: GeneratedAnswerProps = {}
): KnowledgeGeneratedAnswer {
  if (!loadAnswerApiReducer(engine)) {
    throw loadReducerError;
  }

  const {rephrase: coreRephrase, ...controller} = buildCoreGeneratedAnswer(
    engine,
    analyticsClient,
    props
  );
  const getState = () => engine.state;

  return {
    ...controller,

    get state() {
      return {
        ...getState().generatedAnswer,
        answer: selectAnswer(engine.state).data?.answer,
        citations: selectAnswer(engine.state).data?.citations ?? [],
        error: {message: selectAnswer(engine.state).error as string}, // Todo: making sure the error is a string
        isLoading: selectAnswer(engine.state).data?.isLoading ?? false,
        isStreaming: selectAnswer(engine.state).data?.isStreaming ?? false,
        answerContentFormat:
          selectAnswer(engine.state).data?.contentFormat || 'text/plain',
        isAnswerGenerated: selectAnswer(engine.state).data?.generated || false,
      };
    },
    requestGeneratedAnswer() {
      console.log('requesting answer');
      engine.dispatch(fetchAnswer(getState()));
    },
    rephrase(responseFormat: GeneratedResponseFormat) {
      coreRephrase(responseFormat);
      engine.dispatch(fetchAnswer(getState()));
    },
    retry() {
      engine.dispatch(fetchAnswer(getState()));
    },
    reset() {
      engine.dispatch(resetAnswer());
    },
  };
}

function loadAnswerApiReducer(
  engine: CoreEngine
): engine is CoreEngine<GeneratedAnswerSection & SearchSection & DebugSection> {
  engine.addReducers({[answerApi.reducerPath]: answerApi.reducer});
  return true;
}
