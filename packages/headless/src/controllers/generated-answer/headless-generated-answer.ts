import {Unsubscribe} from '@reduxjs/toolkit';
import {GeneratedAnswerCitation} from '../../api/generated-answer/generated-answer-event-payload';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {
  streamAnswer,
  resetAnswer,
  likeGeneratedAnswer,
  dislikeGeneratedAnswer,
  updateResponseFormat,
  openGeneratedAnswerFeedbackModal,
  closeGeneratedAnswerFeedbackModal,
  setIsVisible,
  sendGeneratedAnswerFeedback,
} from '../../features/generated-answer/generated-answer-actions';
import {
  GeneratedAnswerFeedback,
  logDislikeGeneratedAnswer,
  logGeneratedAnswerDetailedFeedback,
  logGeneratedAnswerFeedback,
  logLikeGeneratedAnswer,
  logOpenGeneratedAnswerSource,
  logRephraseGeneratedAnswer,
  logRetryGeneratedAnswer,
  logGeneratedAnswerShowAnswers,
  logGeneratedAnswerHideAnswers,
  logCopyGeneratedAnswer,
  logHoverCitation,
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
  /**
   * Logs a custom event indicating the generated answer was copied to the clipboard.
   */
  logCopyToClipboard(): void;
  /**
   * Logs a custom event indicating a cited source link was hovered.
   * @param citationId The ID of the clicked citation.
   * @param citationHoverTimeMs The number of milliseconds spent hovering over the citation.
   */
  logCitationHover(citationId: string, citationHoverTimeMs: number): void;
}

export interface GeneratedAnswerProps {
  initialState?: {
    /**
     * Sets the component visibility state on load.
     */
    isVisible?: boolean;
    /**
     * The initial formatting options applied to generated answers when the controller first loads.
     */
    responseFormat?: GeneratedResponseFormat;
  };
}

interface SubscribeStateManager {
  abortController: AbortController | undefined;
  lastRequestId: string;
  lastStreamId: string;
  getIsStreamInProgress: () => boolean;
  setAbortControllerRef: (ref: AbortController) => void;
  subscribeToSearchRequests: (
    engine: SearchEngine<GeneratedAnswerSection>
  ) => Unsubscribe;
}

const subscribeStateManager: SubscribeStateManager = {
  abortController: undefined,
  lastRequestId: '',
  lastStreamId: '',

  setAbortControllerRef: (ref: AbortController) => {
    subscribeStateManager.abortController = ref;
  },

  getIsStreamInProgress: () => {
    if (
      !subscribeStateManager.abortController ||
      subscribeStateManager.abortController?.signal.aborted
    ) {
      subscribeStateManager.abortController = undefined;
      return false;
    }
    return true;
  },

  subscribeToSearchRequests: (engine) => {
    const strictListener = () => {
      const state = engine.state;
      const requestId = state.search.requestId;
      const streamId =
        state.search.extendedResults.generativeQuestionAnsweringId;

      if (subscribeStateManager.lastRequestId !== requestId) {
        subscribeStateManager.lastRequestId = requestId;
        subscribeStateManager.abortController?.abort();
        engine.dispatch(resetAnswer());
      }

      const isStreamInProgress = subscribeStateManager.getIsStreamInProgress();
      if (
        !isStreamInProgress &&
        streamId &&
        streamId !== subscribeStateManager.lastStreamId
      ) {
        subscribeStateManager.lastStreamId = streamId;
        engine.dispatch(
          streamAnswer({
            setAbortControllerRef: subscribeStateManager.setAbortControllerRef,
          })
        );
      }
    };
    return engine.subscribe(strictListener);
  },
};

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

  const isVisible = props.initialState?.isVisible;
  if (isVisible !== undefined) {
    dispatch(setIsVisible(isVisible));
  }
  const initialResponseFormat = props.initialState?.responseFormat;
  if (initialResponseFormat) {
    dispatch(updateResponseFormat(initialResponseFormat));
  }

  subscribeStateManager.subscribeToSearchRequests(engine);

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
      dispatch(sendGeneratedAnswerFeedback());
    },

    sendDetailedFeedback(details) {
      dispatch(logGeneratedAnswerDetailedFeedback(details));
      dispatch(sendGeneratedAnswerFeedback());
    },

    logCitationClick(citationId: string) {
      dispatch(logOpenGeneratedAnswerSource(citationId));
    },

    logCitationHover(citationId: string, citationHoverTimeMs: number) {
      dispatch(logHoverCitation(citationId, citationHoverTimeMs));
    },

    rephrase(responseFormat: GeneratedResponseFormat) {
      dispatch(updateResponseFormat(responseFormat));
      dispatch(executeSearch(logRephraseGeneratedAnswer(responseFormat)));
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
    logCopyToClipboard() {
      dispatch(logCopyGeneratedAnswer());
    },
  };
}

function loadGeneratedAnswerReducer(
  engine: SearchEngine
): engine is SearchEngine<GeneratedAnswerSection> {
  engine.addReducers({generatedAnswer});
  return true;
}
