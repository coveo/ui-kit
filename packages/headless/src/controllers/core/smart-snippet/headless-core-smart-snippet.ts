import type {QuestionAnswerDocumentIdentifier} from '../../../api/search/search/question-answering.js';
import type {Result} from '../../../api/search/search/result.js';
import type {CoreEngine} from '../../../app/engine.js';
import type {
  ClickAction,
  CustomAction,
} from '../../../features/analytics/analytics-utils.js';
import {
  closeFeedbackModal,
  collapseSmartSnippet,
  dislikeSmartSnippet,
  expandSmartSnippet,
  likeSmartSnippet,
  openFeedbackModal,
} from '../../../features/question-answering/question-answering-actions.js';
import type {SmartSnippetFeedback} from '../../../features/question-answering/question-answering-analytics-actions.js';
import type {
  QuestionAnsweringInlineLinkActionCreatorPayload,
  QuestionAnsweringUniqueIdentifierActionCreatorPayload,
} from '../../../features/question-answering/question-answering-document-id.js';
import {answerSourceSelector} from '../../../features/question-answering/question-answering-selectors.js';
import {questionAnsweringReducer as questionAnswering} from '../../../features/question-answering/question-answering-slice.js';
import {pushRecentResult} from '../../../features/recent-results/recent-results-actions.js';
import {searchReducer as search} from '../../../features/search/search-slice.js';
import type {
  QuestionAnsweringSection,
  SearchSection,
} from '../../../state/state-sections.js';
import {loadReducerError} from '../../../utils/errors.js';
import {
  buildController,
  type Controller,
} from '../../controller/headless-controller.js';
import type {InlineLink} from '../../smart-snippet/headless-smart-snippet-interactive-inline-links.js';
import {buildInteractiveResultCore} from '../interactive-result/headless-core-interactive-result.js';

export interface SmartSnippetOptions {
  /**
   * The amount of time in milliseconds to wait before selecting the source or inline links after calling `beginDelayedSelectSource` or `beginDelayedSelectInlineLink`.
   *
   * @defaultValue `1000`
   */
  selectionDelay?: number;
}

export interface SmartSnippetProps {
  /**
   * The options for the `SmartSnippet` controller.
   */
  options?: SmartSnippetOptions;
}

export interface SmartSnippetCore extends Controller {
  /**
   * The state of the SmartSnippet controller.
   * */
  state: SmartSnippetState;
  /**
   * Expand the snippet.
   */
  expand(): void;
  /**
   * Collapse the snippet.
   */
  collapse(): void;
  /**
   * Allows the user to signal that a particular answer was relevant.
   */
  like(): void;
  /**
   * Allows the user to signal that a particular answer was not relevant.
   */
  dislike(): void;
  /**
   * Allows the user to signal that they wish to send feedback about why a particular answer was not relevant.
   */
  openFeedbackModal(): void;
  /**
   * Allows the user to signal that they no longer wish to send feedback about why a particular answer was not relevant.
   */
  closeFeedbackModal(): void;
  /**
   * Allows the user to send feedback about why a particular answer was not relevant.
   * @param feedback - The generic feedback that the end user wishes to send.
   */
  sendFeedback(feedback: SmartSnippetFeedback): void;
  /**
   * Allows the user to send detailed feedback about why a particular answer was not relevant.
   * @param details - A personalized message from the end user about the relevance of the answer.
   */
  sendDetailedFeedback(details: string): void;
  /**
   * Selects the source, logging a UA event to the Coveo Platform if the source wasn't already selected before.
   *
   * In a DOM context, call this method on all of the following events:
   * * `contextmenu`
   * * `click`
   * * `mouseup`
   * * `mousedown`
   */
  selectSource(): void;
  /**
   * Prepares to select the source after a certain delay, sending analytics if it was never selected before.
   *
   * In a DOM context, call this method on the `touchstart` event.
   */
  beginDelayedSelectSource(): void;
  /**
   * Cancels the pending selection caused by `beginDelayedSelectSource`.
   *
   * In a DOM context, call this method on the `touchend` event.
   */
  cancelPendingSelectSource(): void;
}

/**
 * The `SmartSnippet` controller lets you display the excerpt of a document that would be most likely to answer a particular query.
 *
 * Example: [smart-snippet.fn.tsx](https://github.com/coveo/ui-kit/blob/c090c1bd676792027815c52507e2aef8ccfaab91/packages/samples/headless-react/src/components/smart-snippet/smart-snippet.fn.tsx)
 *
 * @group Controllers
 * @category SmartSnippet
 */
export interface SmartSnippet extends SmartSnippetCore {
  /**
   * Selects a link inside the answer, logging a UA event to the Coveo Platform if it was never selected before.
   *
   * In a DOM context, call this method on all of the following events:
   * * `contextmenu`
   * * `click`
   * * `mouseup`
   * * `mousedown`
   *
   * @param link - The link to select.
   */
  selectInlineLink(link: InlineLink): void;
  /**
   * Prepares to select a link inside the answer after a certain delay, sending analytics if it was never selected before.
   *
   * In a DOM context, call this method on the `touchstart` event.
   *
   * @param link - The link to select.
   */
  beginDelayedSelectInlineLink(link: InlineLink): void;
  /**
   * Cancels the pending selection caused by `beginDelayedSelectInlineLink`.
   *
   * In a DOM context, call this method on the `touchend` event.
   *
   * @param link - The link to select.
   */
  cancelPendingSelectInlineLink(link: InlineLink): void;
}

/**
 * A scoped and simplified part of the headless engine that is relevant to the `SmartSnippet` controller.
 *
 * @group Controllers
 * @category SmartSnippet
 */
export interface SmartSnippetState {
  /**
   * The question related to the smart snippet.
   */
  question: string;
  /**
   * The answer, or snippet, related to the question.
   */
  answer: string;
  /**
   * The index identifier for the document that provided the answer.
   */
  documentId: QuestionAnswerDocumentIdentifier;
  /**
   * Determines if the snippet is currently expanded.
   */
  expanded: boolean;
  /**
   * Determines of there is an available answer for the current query.
   */
  answerFound: boolean;
  /**
   * Determines if the snippet was liked, or upvoted by the end user.
   */
  liked: boolean;
  /**
   * Determines if the snippet was disliked, or downvoted by the end user.
   */
  disliked: boolean;
  /**
   * Determines if the feedback modal with the purpose of explaining why the end user disliked the snippet is currently opened.
   */
  feedbackModalOpen: boolean;
  /**
   * Provides the source of the smart snippet.
   */
  source?: Result;
}

export interface SmartSnippetAnalyticsClient {
  logExpandSmartSnippet: () => CustomAction;
  logCollapseSmartSnippet: () => CustomAction;
  logLikeSmartSnippet: () => CustomAction;
  logDislikeSmartSnippet: () => CustomAction;
  logOpenSmartSnippetSource: () => ClickAction;
  logOpenSmartSnippetInlineLink: (
    payload: QuestionAnsweringInlineLinkActionCreatorPayload
  ) => ClickAction;
  logOpenSmartSnippetFeedbackModal: () => CustomAction;
  logCloseSmartSnippetFeedbackModal: () => CustomAction;
  logSmartSnippetFeedback: (feedback: SmartSnippetFeedback) => CustomAction;
  logSmartSnippetDetailedFeedback: (details: string) => CustomAction;
  logExpandSmartSnippetSuggestion: (
    payload: QuestionAnsweringUniqueIdentifierActionCreatorPayload
  ) => CustomAction;
  logCollapseSmartSnippetSuggestion: (
    payload: QuestionAnsweringUniqueIdentifierActionCreatorPayload
  ) => CustomAction;
  logOpenSmartSnippetSuggestionSource: (
    payload: QuestionAnsweringUniqueIdentifierActionCreatorPayload
  ) => ClickAction;
}

/**
 * Creates a `SmartSnippet` controller instance.
 *
 * @param engine - The headless engine.
 * @param analyticsClient - A SmartSnippetAnalyticsClient to send the appropriate analytics calls.
 * @param props - The configurable `SmartSnippet` properties.
 * @returns A `SmartSnippetCore` controller instance.
 * */
export function buildCoreSmartSnippet(
  engine: CoreEngine,
  analyticsClient: SmartSnippetAnalyticsClient,
  props?: SmartSnippetProps
): SmartSnippetCore {
  if (!loadSmartSnippetReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const getState = () => engine.state;

  const getResult = () => answerSourceSelector(getState());

  let lastSearchResponseId: string | null = null;
  const interactiveResult = buildInteractiveResultCore(
    engine,
    {options: {selectionDelay: props?.options?.selectionDelay}},
    () => {
      const result = getResult();
      if (!result) {
        lastSearchResponseId = null;
        return;
      }

      const {searchResponseId} = getState().search;
      if (lastSearchResponseId === searchResponseId) {
        return;
      }
      lastSearchResponseId = searchResponseId;
      engine.dispatch(analyticsClient.logOpenSmartSnippetSource());
      engine.dispatch(pushRecentResult(result));
    }
  );

  return {
    ...controller,

    get state() {
      const state = getState();

      return {
        question: state.search.questionAnswer.question,
        answer: state.search.questionAnswer.answerSnippet,
        documentId: state.search.questionAnswer.documentId,
        expanded: state.questionAnswering.expanded,
        answerFound: state.search.questionAnswer.answerSnippet !== '',
        liked: state.questionAnswering.liked,
        disliked: state.questionAnswering.disliked,
        feedbackModalOpen: state.questionAnswering.feedbackModalOpen,
        source: getResult(),
      };
    },
    expand() {
      engine.dispatch(analyticsClient.logExpandSmartSnippet());
      engine.dispatch(expandSmartSnippet());
    },
    collapse() {
      engine.dispatch(analyticsClient.logCollapseSmartSnippet());
      engine.dispatch(collapseSmartSnippet());
    },
    like() {
      engine.dispatch(analyticsClient.logLikeSmartSnippet());
      engine.dispatch(likeSmartSnippet());
    },
    dislike() {
      engine.dispatch(analyticsClient.logDislikeSmartSnippet());
      engine.dispatch(dislikeSmartSnippet());
    },
    openFeedbackModal() {
      engine.dispatch(analyticsClient.logOpenSmartSnippetFeedbackModal());
      engine.dispatch(openFeedbackModal());
    },
    closeFeedbackModal() {
      engine.dispatch(analyticsClient.logCloseSmartSnippetFeedbackModal());
      engine.dispatch(closeFeedbackModal());
    },
    sendFeedback(feedback) {
      engine.dispatch(analyticsClient.logSmartSnippetFeedback(feedback));
      engine.dispatch(closeFeedbackModal());
    },
    sendDetailedFeedback(details) {
      engine.dispatch(analyticsClient.logSmartSnippetDetailedFeedback(details));
      engine.dispatch(closeFeedbackModal());
    },
    selectSource() {
      interactiveResult.select();
    },
    beginDelayedSelectSource() {
      interactiveResult.beginDelayedSelect();
    },
    cancelPendingSelectSource() {
      interactiveResult.cancelPendingSelect();
    },
  };
}

function loadSmartSnippetReducers(
  engine: CoreEngine
): engine is CoreEngine<QuestionAnsweringSection & SearchSection> {
  engine.addReducers({search, questionAnswering});
  return true;
}
