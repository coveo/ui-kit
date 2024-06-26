import {Unsubscribe} from '@reduxjs/toolkit';
import {GeneratedAnswerAPIClient} from '../../../api/generated-answer/generated-answer-client';
import {GeneratedAnswerCitation} from '../../../api/generated-answer/generated-answer-event-payload';
import {CoreEngine} from '../../../app/engine';
import {ClientThunkExtraArguments} from '../../../app/thunk-extra-arguments';
import {
  CustomAction,
  LegacySearchAction,
} from '../../../features/analytics/analytics-utils';
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
  registerFieldsToIncludeInCitations,
  setId,
  expandGeneratedAnswer,
  collapseGeneratedAnswer,
} from '../../../features/generated-answer/generated-answer-actions';
import {
  GeneratedAnswerFeedback,
  GeneratedAnswerFeedbackV2,
} from '../../../features/generated-answer/generated-answer-analytics-actions';
import {generatedAnswerReducer as generatedAnswer} from '../../../features/generated-answer/generated-answer-slice';
import {GeneratedAnswerState} from '../../../features/generated-answer/generated-answer-state';
import {GeneratedResponseFormat} from '../../../features/generated-answer/generated-response-format';
import {
  DebugSection,
  GeneratedAnswerSection,
  SearchSection,
} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {randomID} from '../../../utils/utils';
import {
  Controller,
  buildController,
} from '../../controller/headless-controller';

export type {
  GeneratedAnswerCitation,
  GeneratedResponseFormat,
  GeneratedAnswerState,
};

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
   * Indicates that the generated answer met the user expectations.
   */
  like(): void;
  /**
   * Marks the generated answer as not relevant to the end user.
   */
  dislike(): void;
  /**
   * Re-executes the query to generate the answer in the specified format.
   * @param responseFormat - The formatting options to apply to generated answers.
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
  sendFeedback(
    feedback: GeneratedAnswerFeedback | GeneratedAnswerFeedbackV2
  ): void;
  /**
   * Sends detailed feedback about why the generated answer was not relevant.
   * @param details - Details on why the generated answer was not relevant.
   */
  sendDetailedFeedback(details: string): void;
  /**
   * Logs a custom event indicating a cited source link was clicked.
   * @param id - The ID of the clicked citation.
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
   * Expands the generated answer.
   */
  expand(): void;
  /**
   * Collapses the generated answer.
   */
  collapse(): void;
  /**
   * Logs a custom event indicating the generated answer was copied to the clipboard.
   */
  logCopyToClipboard(): void;
  /**
   * Logs a custom event indicating a cited source link was hovered.
   * @param citationId - The ID of the clicked citation.
   * @param citationHoverTimeMs - The number of milliseconds spent hovering over the citation.
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
    /**
     * The initial expanded state of the generated answer.
     */
    expanded?: boolean;
  };
  /**
   * A list of indexed fields to include in the citations returned with the generated answer.
   */
  fieldsToIncludeInCitations?: string[];
}

interface SubscribeStateManager {
  engines: Record<
    string,
    {
      abortController: AbortController | undefined;
      lastRequestId: string;
      lastStreamId: string;
    }
  >;
  getIsStreamInProgress: (genQaEngineId: string) => boolean;
  setAbortControllerRef: (ref: AbortController, genQaEngineId: string) => void;
  subscribeToSearchRequests: (
    engine: CoreEngine<
      GeneratedAnswerSection & SearchSection & DebugSection,
      ClientThunkExtraArguments<GeneratedAnswerAPIClient>
    >
  ) => Unsubscribe;
}

const subscribeStateManager: SubscribeStateManager = {
  engines: {},

  setAbortControllerRef: (ref: AbortController, genQaEngineId: string) => {
    subscribeStateManager.engines[genQaEngineId].abortController = ref;
  },

  getIsStreamInProgress: (genQaEngineId: string) => {
    if (
      !subscribeStateManager.engines[genQaEngineId].abortController ||
      subscribeStateManager.engines[genQaEngineId].abortController?.signal
        .aborted
    ) {
      subscribeStateManager.engines[genQaEngineId].abortController = undefined;
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
      const genQaEngineId = state.generatedAnswer.id;

      if (
        subscribeStateManager.engines[genQaEngineId].lastRequestId !== requestId
      ) {
        subscribeStateManager.engines[genQaEngineId].lastRequestId = requestId;
        subscribeStateManager.engines[genQaEngineId].abortController?.abort();
        engine.dispatch(resetAnswer());
      }

      const isStreamInProgress =
        subscribeStateManager.getIsStreamInProgress(genQaEngineId);
      if (
        !isStreamInProgress &&
        streamId &&
        streamId !== subscribeStateManager.engines[genQaEngineId].lastStreamId
      ) {
        subscribeStateManager.engines[genQaEngineId].lastStreamId = streamId;
        engine.dispatch(
          streamAnswer({
            setAbortControllerRef: (ref: AbortController) =>
              subscribeStateManager.setAbortControllerRef(ref, genQaEngineId),
          })
        );
      }
    };
    return engine.subscribe(strictListener);
  },
};

export interface GeneratedAnswerAnalyticsClient {
  logLikeGeneratedAnswer: () => CustomAction;
  logDislikeGeneratedAnswer: () => CustomAction;
  logGeneratedAnswerFeedback: (
    feedback: GeneratedAnswerFeedback | GeneratedAnswerFeedbackV2
  ) => CustomAction;
  logGeneratedAnswerDetailedFeedback: (details: string) => CustomAction;
  logOpenGeneratedAnswerSource: (citationId: string) => CustomAction;
  logHoverCitation: (
    citationId: string,
    citationHoverTimeMs: number
  ) => CustomAction;
  logGeneratedAnswerShowAnswers: () => CustomAction;
  logGeneratedAnswerHideAnswers: () => CustomAction;
  logCopyGeneratedAnswer: () => CustomAction;
  logRephraseGeneratedAnswer: (
    responseFormat: GeneratedResponseFormat
  ) => LegacySearchAction;
  logRetryGeneratedAnswer: () => LegacySearchAction;
  logGeneratedAnswerExpand: () => CustomAction;
  logGeneratedAnswerCollapse: () => CustomAction;
}

/**
 * Creates a core `GeneratedAnswer` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `GeneratedAnswer` properties.
 * @returns A `GeneratedAnswer` controller instance.
 */
export function buildCoreGeneratedAnswer(
  engine: CoreEngine,
  analyticsClient: GeneratedAnswerAnalyticsClient,
  props: GeneratedAnswerProps = {}
): GeneratedAnswer {
  if (!loadGeneratedAnswerReducer(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;
  const controller = buildController(engine);
  const getState = () => engine.state;

  if (!engine.state.generatedAnswer.id) {
    const genQaEngineId = randomID('genQA-', 12);
    dispatch(setId({id: genQaEngineId}));
    subscribeStateManager.engines[genQaEngineId] = {
      abortController: undefined,
      lastRequestId: '',
      lastStreamId: '',
    };
  }

  const isVisible = props.initialState?.isVisible;
  if (isVisible !== undefined) {
    dispatch(setIsVisible(isVisible));
  }
  const initialResponseFormat = props.initialState?.responseFormat;
  if (initialResponseFormat) {
    dispatch(updateResponseFormat(initialResponseFormat));
  }

  const fieldsToIncludeInCitations = props.fieldsToIncludeInCitations;
  if (fieldsToIncludeInCitations) {
    dispatch(registerFieldsToIncludeInCitations(fieldsToIncludeInCitations));
  }

  const expanded = props.initialState?.expanded;
  if (expanded) {
    dispatch(expandGeneratedAnswer());
  }

  subscribeStateManager.subscribeToSearchRequests(engine);

  return {
    ...controller,

    get state() {
      return getState().generatedAnswer;
    },

    like() {
      if (!this.state.liked) {
        dispatch(likeGeneratedAnswer());
        dispatch(analyticsClient.logLikeGeneratedAnswer());
      }
    },

    dislike() {
      if (!this.state.disliked) {
        dispatch(dislikeGeneratedAnswer());
        dispatch(analyticsClient.logDislikeGeneratedAnswer());
      }
    },

    openFeedbackModal() {
      dispatch(openGeneratedAnswerFeedbackModal());
    },

    closeFeedbackModal() {
      dispatch(closeGeneratedAnswerFeedbackModal());
    },

    sendFeedback(feedback) {
      dispatch(analyticsClient.logGeneratedAnswerFeedback(feedback));
      dispatch(sendGeneratedAnswerFeedback());
    },

    sendDetailedFeedback(details) {
      dispatch(analyticsClient.logGeneratedAnswerDetailedFeedback(details));
      dispatch(sendGeneratedAnswerFeedback());
    },

    logCitationClick(citationId: string) {
      dispatch(analyticsClient.logOpenGeneratedAnswerSource(citationId));
    },

    logCitationHover(citationId: string, citationHoverTimeMs: number) {
      dispatch(
        analyticsClient.logHoverCitation(citationId, citationHoverTimeMs)
      );
    },

    rephrase(responseFormat: GeneratedResponseFormat) {
      dispatch(updateResponseFormat(responseFormat));
    },

    show() {
      if (!this.state.isVisible) {
        dispatch(setIsVisible(true));
        dispatch(analyticsClient.logGeneratedAnswerShowAnswers());
      }
    },

    hide() {
      if (this.state.isVisible) {
        dispatch(setIsVisible(false));
        dispatch(analyticsClient.logGeneratedAnswerHideAnswers());
      }
    },

    expand() {
      if (!this.state.expanded) {
        dispatch(expandGeneratedAnswer());
        dispatch(analyticsClient.logGeneratedAnswerExpand());
      }
    },

    collapse() {
      if (this.state.expanded) {
        dispatch(collapseGeneratedAnswer());
        dispatch(analyticsClient.logGeneratedAnswerCollapse());
      }
    },

    logCopyToClipboard() {
      dispatch(analyticsClient.logCopyGeneratedAnswer());
    },

    retry() {},
  };
}

function loadGeneratedAnswerReducer(
  engine: CoreEngine
): engine is CoreEngine<GeneratedAnswerSection & SearchSection & DebugSection> {
  engine.addReducers({generatedAnswer});
  return true;
}
