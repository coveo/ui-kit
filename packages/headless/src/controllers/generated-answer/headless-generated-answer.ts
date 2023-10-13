import {GeneratedAnswerCitation} from '../../api/generated-answer/generated-answer-event-payload';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {
  streamAnswer,
  resetAnswer,
  likeGeneratedAnswer,
  dislikeGeneratedAnswer,
  openGeneratedAnswerFeedbackModal,
  closeGeneratedAnswerFeedbackModal,
  setIsVisible,
} from '../../features/generated-answer/generated-answer-actions';
import {
  GeneratedAnswerFeedback,
  logDislikeGeneratedAnswer,
  logGeneratedAnswerDetailedFeedback,
  logGeneratedAnswerFeedback,
  logLikeGeneratedAnswer,
  logOpenGeneratedAnswerSource,
  logRetryGeneratedAnswer,
  logGeneratedAnswerShowAnswers,
  logGeneratedAnswerHideAnswers,
} from '../../features/generated-answer/generated-answer-analytics-actions';
import {generatedAnswerReducer as generatedAnswer} from '../../features/generated-answer/generated-answer-slice';
import {GeneratedAnswerState} from '../../features/generated-answer/generated-answer-state';
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
   * Opens the modal to provide feedback about why the generated answer was not relevant.
   */
  openFeedbackModal(): void;
  /**
   * Closes the modal to provide feedback about why the generated answer was not relevant.
   */
  closeFeedbackModal(): void;
  /**
   * Sends feedback about why the generated answer was not relevant.
   * @param feedback - The feedback that the end user wishes to send.
   */
  sendFeedback(feedback: GeneratedAnswerFeedback): void;
  /**
   * Sends detailed feedback about why the generated answer was not relevant.
   * @param details - Details on why the generated answer was not relevant.
   */
  sendDetailedFeedback(details: string): void;
  /**
   * Logs a custom event indicating a cited source link was clicked.
   * @param id The ID of the clicked citation.
   */
  logCitationClick(id: string): void;
  /**
   * Displays the generated answer.
   */
  show(): void;
  /**
   * Hides the generated answer.
   */
  hide(): void;
}

export interface GeneratedAnswerProps {
  initialState?: {isVisible: boolean};
}

/**
 * @internal
 */
export function buildGeneratedAnswer(
  engine: SearchEngine,
  props: GeneratedAnswerProps = {}
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

  const isVisible = props.initialState?.isVisible;
  if (isVisible !== undefined) {
    dispatch(setIsVisible(isVisible));
  }
  subscribeToSearchRequests();

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

    openFeedbackModal() {
      dispatch(openGeneratedAnswerFeedbackModal());
    },

    closeFeedbackModal() {
      dispatch(closeGeneratedAnswerFeedbackModal());
    },

    sendFeedback(feedback) {
      dispatch(logGeneratedAnswerFeedback(feedback));
      dispatch(closeGeneratedAnswerFeedbackModal());
    },

    sendDetailedFeedback(details) {
      dispatch(logGeneratedAnswerDetailedFeedback(details));
      dispatch(closeGeneratedAnswerFeedbackModal());
    },

    logCitationClick(citationId: string) {
      dispatch(logOpenGeneratedAnswerSource(citationId));
    },

    show() {
      if (!this.state.isVisible) {
        dispatch(setIsVisible(true));
        dispatch(logGeneratedAnswerShowAnswers());
      }
    },
    hide() {
      if (this.state.isVisible) {
        dispatch(setIsVisible(false));
        dispatch(logGeneratedAnswerHideAnswers());
      }
    },
  };
}

function loadGeneratedAnswerReducer(
  engine: SearchEngine
): engine is SearchEngine<GeneratedAnswerSection> {
  engine.addReducers({generatedAnswer});
  return true;
}
