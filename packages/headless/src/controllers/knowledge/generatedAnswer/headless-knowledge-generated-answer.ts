import {
  answerApi,
  fetchAnswer,
  selectAnswer,
  selectAnswerTriggerParams,
  StateNeededByAnswerAPI,
} from '../../../api/knowledge/stream-answer-api';
import {SearchEngine} from '../../../app/search-engine/search-engine';
import {
  resetAnswer,
  updateAnswerConfigurationId,
} from '../../../features/generated-answer/generated-answer-actions';
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

export interface KnowledgeGeneratedAnswer extends GeneratedAnswer {
  /**
   * Resets the last answer.
   */
  reset(): void;
}

interface KnowledgeGeneratedAnswerProps extends GeneratedAnswerProps {}

export interface SearchAPIGeneratedAnswerAnalyticsClient
  extends GeneratedAnswerAnalyticsClient {}

const subscribeToSearchRequest = (
  engine: SearchEngine<StateNeededByAnswerAPI>
) => {
  let lastTriggerParams: ReturnType<typeof selectAnswerTriggerParams>;
  const strictListener = () => {
    const state = engine.state;
    const triggerParams = selectAnswerTriggerParams(state);
    if (triggerParams.requestId === undefined) {
      return;
    }
    if (JSON.stringify(triggerParams) === JSON.stringify(lastTriggerParams)) {
      return;
    }
    lastTriggerParams = triggerParams;
    engine.dispatch(fetchAnswer(state));
  };
  engine.subscribe(strictListener);
};

/**
 * Creates a `GeneratedAnswer` controller instance using the Answer API stream pattern.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `GeneratedAnswer` properties.
 * @returns A `GeneratedAnswer` controller instance.
 */
export function buildKnowledgeGeneratedAnswer(
  engine: SearchEngine,
  analyticsClient: SearchAPIGeneratedAnswerAnalyticsClient,
  props: KnowledgeGeneratedAnswerProps = {}
): KnowledgeGeneratedAnswer {
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
      const answerApiState = selectAnswer(engine.state).data;
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

function loadAnswerApiReducers(
  engine: SearchEngine
): engine is SearchEngine<
  GeneratedAnswerSection &
    QuerySection & {answer: ReturnType<typeof answerApi.reducer>}
> {
  engine.addReducers({[answerApi.reducerPath]: answerApi.reducer, query});
  return true;
}
