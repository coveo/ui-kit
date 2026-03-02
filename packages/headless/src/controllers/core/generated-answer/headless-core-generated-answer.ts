import type {CoreEngine} from '../../../app/engine.js';
import type {
  CustomAction,
  LegacySearchAction,
} from '../../../features/analytics/analytics-utils.js';
import {
  closeGeneratedAnswerFeedbackModal,
  collapseGeneratedAnswer,
  dislikeGeneratedAnswer,
  expandGeneratedAnswer,
  likeGeneratedAnswer,
  openGeneratedAnswerFeedbackModal,
  registerFieldsToIncludeInCitations,
  sendGeneratedAnswerFeedback,
  setIsEnabled,
  setIsVisible,
  updateResponseFormat,
} from '../../../features/generated-answer/generated-answer-actions.js';
import type {GeneratedAnswerFeedback} from '../../../features/generated-answer/generated-answer-analytics-actions.js';
import {generatedAnswerReducer as generatedAnswer} from '../../../features/generated-answer/generated-answer-slice.js';
import type {GeneratedAnswerState} from '../../../features/generated-answer/generated-answer-state.js';
import type {GeneratedResponseFormat} from '../../../features/generated-answer/generated-response-format.js';
import type {
  DebugSection,
  GeneratedAnswerSection,
  SearchSection,
} from '../../../state/state-sections.js';
import {loadReducerError} from '../../../utils/errors.js';
import {
  buildController,
  type Controller,
} from '../../controller/headless-controller.js';

/**
 * The `GeneratedAnswer` controller uses Coveo Machine Learning (Coveo ML) models to automatically generate an answer to a query executed by the user.
 *
 * @group Controllers
 * @category GeneratedAnswer
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
   * Indicates that the generated answer met the user expectations.
   * @deprecated The no-argument `like` method is deprecated and will be removed in a future major version.
   */
  like(): void;
  /**
   * Indicates that the generated answer met the user expectations.
   * @param answerId - Answer Id of the liked answer.
   */
  like(answerId: string): void;
  /**
   * Marks the generated answer as not relevant to the end user.
   * @deprecated The no-argument `dislike` method is deprecated and will be removed in a future major version.
   */
  dislike(): void;
  /**
   * Marks the generated answer as not relevant to the end user.
   * @param answerId - Answer Id of the disliked answer.
   */
  dislike(answerId: string): void;
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
   * Enables the generated answer.
   */
  enable(): void;
  /**
   * Disables the generated answer.
   */
  disable(): void;
  /**
   * Logs a custom event indicating the generated answer was copied to the clipboard.
   * @deprecated The `logCopyToClipboard` method is deprecated and will be removed in a future major version.
   */
  logCopyToClipboard(): void;
  /**
   * Logs a custom event indicating the generated answer was copied to the clipboard.
   * @param answerId - Answer Id of the copied answer.
   */
  logCopyToClipboard(answerId: string): void;
  /**
   * Logs a custom event indicating a cited source link was clicked.
   * @param citationId - The ID of the clicked citation.
   * @deprecated The `logCitationClick` method is deprecated and will be removed in a future major version.
   */
  logCitationClick(citationId: string): void;
  /**
   * Logs a custom event indicating a cited source link was clicked.
   * @param citationId - The ID of the clicked citation.
   */
  logCitationClick(citationId: string, answerId: string): void;
  /**
   * Logs a custom event indicating a cited source link was hovered.
   * @param citationId - The ID of the clicked citation.
   * @param citationHoverTimeMs - The number of milliseconds spent hovering over the citation.
   * @deprecated The `logCitationHover` method is deprecated and will be removed in a future major version.
   */
  logCitationHover(citationId: string, citationHoverTimeMs: number): void;
  /**
   * Logs a custom event indicating a cited source link was hovered.
   * @param citationId - The ID of the clicked citation.
   * @param citationHoverTimeMs - The number of milliseconds spent hovering over the citation.
   * @param answerId - Answer Id of the hovered citation's answer.
   */
  logCitationHover(
    citationId: string,
    citationHoverTimeMs: number,
    answerId: string
  ): void;
}

export interface GeneratedAnswerAnalyticsClient {
  logLikeGeneratedAnswer(): CustomAction;
  logLikeGeneratedAnswer(answerId: string): CustomAction;
  logDislikeGeneratedAnswer(): CustomAction;
  logDislikeGeneratedAnswer(answerId: string): CustomAction;
  logGeneratedAnswerFeedback: (
    feedback: GeneratedAnswerFeedback
  ) => CustomAction;
  logOpenGeneratedAnswerSource(citationId: string): CustomAction;
  logOpenGeneratedAnswerSource(
    citationId: string,
    answerId: string
  ): CustomAction;
  logHoverCitation(
    citationId: string,
    citationHoverTimeMs: number
  ): CustomAction;
  logHoverCitation(
    citationId: string,
    citationHoverTimeMs: number,
    answerId: string
  ): CustomAction;
  logGeneratedAnswerShowAnswers: () => CustomAction;
  logGeneratedAnswerHideAnswers: () => CustomAction;
  logCopyGeneratedAnswer(): CustomAction;
  logCopyGeneratedAnswer(answerId: string): CustomAction;
  logRetryGeneratedAnswer: () => LegacySearchAction;
  logGeneratedAnswerExpand: () => CustomAction;
  logGeneratedAnswerCollapse: () => CustomAction;
}

export interface GeneratedAnswerPropsInitialState {
  initialState?: {
    /**
     * Sets the component visibility state on load.
     */
    isVisible?: boolean;
    /**
     * Sets the component enabled state on load.
     */
    isEnabled?: boolean;
    /**
     * The initial formatting options applied to generated answers when the controller first loads.
     */
    responseFormat?: GeneratedResponseFormat;
    /**
     * The initial expanded state of the generated answer.
     */
    expanded?: boolean;
  };
}

export interface GeneratedAnswerProps extends GeneratedAnswerPropsInitialState {
  /**
   * The answer configuration ID used to leverage coveo answer management capabilities.
   */
  answerConfigurationId?: string;
  /**
   * The agent ID that identifies the agent used for generating the answer.
   */
  agentId?: string;
  /**
   * A list of indexed fields to include in the citations returned with the generated answer.
   */
  fieldsToIncludeInCitations?: string[];
}

/**
 * Can be used as a basis for controllers aiming to return a `GeneratedAnswer` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `GeneratedAnswer` properties.
 * @returns A `GeneratedAnswer` controller instance.
 *
 * @group Controllers
 * @category GeneratedAnswer
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

  return {
    ...controller,

    get state() {
      return getState().generatedAnswer;
    },

    // TODO: SFINT-6665
    like(answerId?: string) {
      if (!this.state.liked) {
        dispatch(likeGeneratedAnswer());
        dispatch(
          answerId
            ? analyticsClient.logLikeGeneratedAnswer(answerId)
            : analyticsClient.logLikeGeneratedAnswer()
        );
      }
    },

    // TODO: SFINT-6665
    dislike(answerId?: string) {
      if (!this.state.disliked) {
        dispatch(dislikeGeneratedAnswer());
        dispatch(
          answerId
            ? analyticsClient.logDislikeGeneratedAnswer(answerId)
            : analyticsClient.logDislikeGeneratedAnswer()
        );
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

    // TODO: SFINT-6665
    logCitationClick(citationId: string, answerId?: string) {
      dispatch(
        answerId
          ? analyticsClient.logOpenGeneratedAnswerSource(citationId, answerId)
          : analyticsClient.logOpenGeneratedAnswerSource(citationId)
      );
    },

    // TODO: SFINT-6665
    logCitationHover(
      citationId: string,
      citationHoverTimeMs: number,
      answerId?: string
    ) {
      dispatch(
        answerId
          ? analyticsClient.logHoverCitation(
              citationId,
              citationHoverTimeMs,
              answerId
            )
          : analyticsClient.logHoverCitation(citationId, citationHoverTimeMs)
      );
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

    enable() {
      if (!this.state.isEnabled) {
        dispatch(setIsEnabled(true));
      }
    },

    disable() {
      if (this.state.isEnabled) {
        dispatch(setIsEnabled(false));
      }
    },

    // TODO: SFINT-6665
    logCopyToClipboard(answerId?: string) {
      dispatch(
        answerId
          ? analyticsClient.logCopyGeneratedAnswer(answerId)
          : analyticsClient.logCopyGeneratedAnswer()
      );
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
