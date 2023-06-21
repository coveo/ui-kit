import {EventSourcePolyfill} from 'event-source-polyfill';
import {
  GeneratedAnswerCitation,
  GeneratedAnswerCitationsPayload,
  GeneratedAnswerMessagePayload,
} from '../../api/generated-answer/generated-answer-event-payload';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {
  updateMessage,
  updateError,
  streamAnswer,
  resetAnswer,
  SSEErrorPayload,
  updateCitations,
  setIsLoading,
} from '../../features/generated-answer/generated-answer-actions';
import {
  logDislikeGeneratedAnswer,
  logLikeGeneratedAnswer,
  logOpenGeneratedAnswerSource,
  logRetryGeneratedAnswer,
} from '../../features/generated-answer/generated-answer-analytics-actions';
import {generatedAnswerReducer as generatedAnswer} from '../../features/generated-answer/generated-answer-slice';
import {GeneratedAnswerState} from '../../features/generated-answer/generated-answer-state';
import {executeSearch} from '../../features/search/search-actions';
import {GeneratedAnswerSection} from '../../state/state-sections';
import {loadReducerError} from '../../utils/errors';
import {buildController} from '../controller/headless-controller';

export type {GeneratedAnswerState, GeneratedAnswerCitation};

/**
 * @internal
 */
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
  likeGeneratedAnswer(): void;
  /**
   * Logs a custom event indicating a generated answer is irrelevant.
   */
  dislikeGeneratedAnswer(): void;
  /**
   * Logs a custom event indicating a cited source link was clicked.
   */
  logCitationClick(citation: GeneratedAnswerCitation): void;
}

/**
 * @internal
 */
export function buildGeneratedAnswer(engine: SearchEngine): GeneratedAnswer {
  if (!loadGeneratedAnswerReducer(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;
  const controller = buildController(engine);
  const getState = () => engine.state;

  let source: EventSourcePolyfill;
  let lastRequestId: string;
  let lastStreamId: string;

  const onMessage = (payload: GeneratedAnswerMessagePayload) =>
    dispatch(updateMessage(payload));

  const onCitations = (payload: GeneratedAnswerCitationsPayload) =>
    dispatch(updateCitations(payload));

  const onError = (error: SSEErrorPayload) => {
    source?.close();
    dispatch(updateError(error));
  };

  const onCompleted = () => {
    source?.close();
    dispatch(setIsLoading(false));
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
        state.search.extendedResults.generativeQuestionAnsweringId;

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
            onCitations,
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
      dispatch(executeSearch(logRetryGeneratedAnswer()));
    },

    likeGeneratedAnswer() {
      dispatch(logLikeGeneratedAnswer());
    },

    dislikeGeneratedAnswer() {
      dispatch(logDislikeGeneratedAnswer());
    },

    logCitationClick(citation: GeneratedAnswerCitation) {
      dispatch(logOpenGeneratedAnswerSource(citation));
    },
  };
}

function loadGeneratedAnswerReducer(
  engine: SearchEngine
): engine is SearchEngine<GeneratedAnswerSection> {
  engine.addReducers({generatedAnswer});
  return true;
}
