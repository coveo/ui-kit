import {GeneratedAnswerCitation} from '../../api/generated-answer/generated-answer-event-payload';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {
  streamAnswer,
  resetAnswer,
  likeGeneratedAnswer,
  dislikeGeneratedAnswer,
  updateResponseFormat,
} from '../../features/generated-answer/generated-answer-actions';
import {
  logDislikeGeneratedAnswer,
  logLikeGeneratedAnswer,
  logOpenGeneratedAnswerSource,
  logRephraseGeneratedAnswer,
  logRetryGeneratedAnswer,
} from '../../features/generated-answer/generated-answer-analytics-actions';
import {generatedAnswerReducer as generatedAnswer} from '../../features/generated-answer/generated-answer-slice';
import {GeneratedAnswerState} from '../../features/generated-answer/generated-answer-state';
import {GeneratedResponseFormat} from '../../features/generated-answer/generated-response-format';
import {executeSearch} from '../../features/search/search-actions';
import {GeneratedAnswerSection} from '../../state/state-sections';
import {loadReducerError} from '../../utils/errors';
import {Controller, buildController} from '../controller/headless-controller';

export type {GeneratedAnswerState, GeneratedAnswerCitation};

/**
 * @internal
 */
export interface GeneratedAnswer extends Controller {
  /**
   * The state of the GeneratedAnswer controller.
   */
  state: GeneratedAnswerState;
  /**
   * Re-executes the last query to generate an answer.
   */
  retry(): void;
  /**
   * Determines if the generated answer was liked, or upvoted by the end user.
   */
  like(): void;
  /**
   * Determines if the generated answer was disliked, or downvoted by the end user.
   */
  dislike(): void;
  /**
   * Re-executes the query to generate the answer in the specified format.
   */
  rephrase(responseFormat: GeneratedResponseFormat): void;
  /**
   * Logs a custom event indicating a cited source link was clicked.
   * @param id The ID of the clicked citation.
   */
  logCitationClick(id: string): void;
}

/**
 * @internal
 */
export interface GeneratedAnswerProps {
  /**
   * The desired format to apply to generated answers when the controller first loads.
   */
  responseFormat: GeneratedResponseFormat;
}

/**
 * @internal
 */
export function buildGeneratedAnswer(
  engine: SearchEngine,
  props?: GeneratedAnswerProps
): GeneratedAnswer {
  if (!loadGeneratedAnswerReducer(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;
  const controller = buildController(engine);
  const getState = () => engine.state;

  let abortController: AbortController | undefined;
  let lastRequestId: string;
  let lastStreamId: string;

  const setAbortControllerRef = (ref: AbortController) => {
    abortController = ref;
  };

  const getIsStreamInProgress = () => {
    if (!abortController || abortController?.signal.aborted) {
      abortController = undefined;
      return false;
    }
    return true;
  };

  const subscribeToSearchRequests = () => {
    const strictListener = () => {
      const state = getState();
      const requestId = state.search.requestId;
      const streamId =
        state.search.extendedResults.generativeQuestionAnsweringId;

      if (lastRequestId !== requestId) {
        lastRequestId = requestId;
        abortController?.abort();
        dispatch(resetAnswer());
      }

      const isStreamInProgress = getIsStreamInProgress();
      if (!isStreamInProgress && streamId && streamId !== lastStreamId) {
        lastStreamId = streamId;
        dispatch(
          streamAnswer({
            setAbortControllerRef,
          })
        );
      }
    };
    return engine.subscribe(strictListener);
  };

  subscribeToSearchRequests();

  if (props?.responseFormat) {
    dispatch(updateResponseFormat(props.responseFormat));
  }

  return {
    ...controller,

    get state() {
      return getState().generatedAnswer;
    },

    retry() {
      dispatch(executeSearch(logRetryGeneratedAnswer()));
    },

    like() {
      dispatch(likeGeneratedAnswer());
      dispatch(logLikeGeneratedAnswer());
    },

    dislike() {
      dispatch(dislikeGeneratedAnswer());
      dispatch(logDislikeGeneratedAnswer());
    },

    logCitationClick(citationId: string) {
      dispatch(logOpenGeneratedAnswerSource(citationId));
    },

    rephrase(responseFormat: GeneratedResponseFormat) {
      dispatch(updateResponseFormat(responseFormat));
      dispatch(executeSearch(logRephraseGeneratedAnswer(responseFormat)));
    },
  };
}

function loadGeneratedAnswerReducer(
  engine: SearchEngine
): engine is SearchEngine<GeneratedAnswerSection> {
  engine.addReducers({generatedAnswer});
  return true;
}
