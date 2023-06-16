import {EventSourcePolyfill} from 'event-source-polyfill';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {
  sseMessage,
  sseError,
  sseComplete,
  streamAnswer,
  resetAnswer,
  SSEErrorPayload,
} from '../../features/generated-answer/generated-answer-actions';
import {generatedAnswerReducer as generatedAnswer} from '../../features/generated-answer/generated-answer-slice';
import {GeneratedAnswerState} from '../../features/generated-answer/generated-answer-state';
import {logSearchboxSubmit} from '../../features/query/query-analytics-actions';
import {executeSearch} from '../../features/search/search-actions';
import {GeneratedAnswerSection} from '../../state/state-sections';
import {loadReducerError} from '../../utils/errors';
import {buildController} from '../controller/headless-controller';

export type {GeneratedAnswerState};

export interface GeneratedAnswer {
  /**
   * The state of the GeneratedAnswer controller.
   */
  state: GeneratedAnswerState;
  /**
   * Re-executes the last query to generate an answer.
   */
  retry(): void;
  /**
   * Logs a custom event indicating a generated answer is relevant.
   */
  logLikeGeneratedAnswer(): void;
  /**
   * Logs a custom event indicating a generated answer is irrelevant.
   */
  logDislikeGeneratedAnswer(): void;
}

/**
 * Creates a `GeneratedAnswer` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `GeneratedAnswer` properties.
 * @returns A `GeneratedAnswer` controller instance.
 * */
export function buildGeneratedAnswer(engine: SearchEngine): GeneratedAnswer {
  if (!loadGeneratedAnswerReducer(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;
  const controller = buildController(engine);
  const getState = () => engine.state;

  let timeout: ReturnType<typeof setTimeout>;
  let source: EventSourcePolyfill;
  let lastRequestId: string;
  let lastStreamId: string;

  const onMessage = (message: string) => {
    dispatch(sseMessage(message));
  };

  const onError = (error: SSEErrorPayload) => {
    source?.close();
    clearTimeout(timeout);
    dispatch(sseError(error));
  };

  const onCompleted = () => {
    source?.close();
    clearTimeout(timeout);
    dispatch(sseComplete());
  };

  const setEventSourceRef = (sourceRef: EventSourcePolyfill) => {
    source = sourceRef;
  };

  const getIsStreamInProgress = () =>
    source &&
    (source.readyState === source.OPEN ||
      source.readyState === source.CONNECTING);

  const subscribeToSearchRequests = () => {
    const strictListener = () => {
      const state = getState();
      const requestId = state.search.requestId;
      const streamId =
        state.search.extendedResults?.generativeQuestionAnsweringId;

      if (lastRequestId !== requestId) {
        lastRequestId = requestId;
        source?.close();
        dispatch(resetAnswer());
      }

      const isStreamInProgress = getIsStreamInProgress();
      if (!isStreamInProgress && streamId && streamId !== lastStreamId) {
        lastStreamId = streamId;
        dispatch(
          streamAnswer({
            onMessage,
            onError,
            onCompleted,
            setEventSourceRef,
          })
        );
      }
    };
    return engine.subscribe(strictListener);
  };

  subscribeToSearchRequests();

  return {
    ...controller,

    get state() {
      return getState().generatedAnswer;
    },

    retry() {
      // TODO: Swap for real analytics event
      dispatch(executeSearch(logSearchboxSubmit()));
      //dispatch(executeSearch(logRetryGeneratedAnswer()));
    },

    logLikeGeneratedAnswer() {
      console.log('👍');
      //dispatch(logLikeGeneratedAnswer());
    },

    logDislikeGeneratedAnswer() {
      console.log('👎');
      //dispatch(logDislikeGeneratedAnswer());
    },
  };
}

function loadGeneratedAnswerReducer(
  engine: SearchEngine
): engine is SearchEngine<GeneratedAnswerSection> {
  engine.addReducers({generatedAnswer});
  return true;
}
