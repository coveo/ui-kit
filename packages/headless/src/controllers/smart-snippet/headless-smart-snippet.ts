import {buildController, Controller} from '../controller/headless-controller';
import {Result} from '../../api/search/search/result';
import {search, questionAnswering} from '../../app/reducers';
import {loadReducerError} from '../../utils/errors';
import {QuestionAnswerDocumentIdentifier} from '../../api/search/search/question-answering';
import {
  logCollapseSmartSnippet,
  logDislikeSmartSnippet,
  logExpandSmartSnippet,
  logLikeSmartSnippet,
  logOpenSmartSnippetSource,
  logOpenSmartSnippetFeedbackModal,
  logCloseSmartSnippetFeedbackModal,
  logSmartSnippetFeedback,
  logSmartSnippetDetailedFeedback,
  SmartSnippetFeedback,
} from '../../features/question-answering/question-answering-analytics-actions';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {
  closeFeedbackModal,
  collapseSmartSnippet,
  dislikeSmartSnippet,
  expandSmartSnippet,
  likeSmartSnippet,
  openFeedbackModal,
} from '../../features/question-answering/question-answering-actions';
import {QuestionAnsweringSection} from '../../state/state-sections';
import {getResultProperty} from '../../features/result-templates/result-templates-helpers';
import {pushRecentResult} from '../../features/recent-results/recent-results-actions';
import {buildInteractiveResultCore} from '../core/interactive-result/headless-core-interactive-result';

export type {QuestionAnswerDocumentIdentifier} from '../../api/search/search/question-answering';

export interface SmartSnippetOptions {
  /**
   * The amount of time to wait before selecting the source after calling `source.beginDelayedSelect`.
   *
   * @defaultValue `1000`
   */
  selectionDelay?: number;
}

export interface SmartSnippetProps {
  /**
   * The options for the `Tab` controller.
   */
  options?: SmartSnippetOptions;
}

/**
 * The `SmartSnippetSource` controller provides an interface for triggering desirable side effects, such as logging UA events to the Coveo Platform, when a user selects the source of a result.
 */
export interface SmartSnippetSource {
  /**
   * Selects the source, logging a UA event to the Coveo Platform if the source wasn't selected before.
   *
   * In a DOM context, it's recommended to call this method on all of the following events:
   * * `contextmenu`
   * * `click`
   * * `mouseup`
   * * `mousedown`
   */
  select(): void;

  /**
   * Prepares to select the source after a certain delay, sending analytics if it was never selected before.
   *
   * In a DOM context, it's recommended to call this method on the `touchstart` event.
   */
  beginDelayedSelect(): void;

  /**
   * Cancels the pending selection caused by `beginDelayedSelect`.
   *
   * In a DOM context, it's recommended to call this method on the `touchend` event.
   */
  cancelPendingSelect(): void;
}

/**
 * The `SmartSnippet` controller allows to manage the excerpt of a document that would be most likely to answer a particular query .
 */
export interface SmartSnippet extends Controller {
  /**
   * The state of the SmartSnippet controller.
   * */
  state: SmartSnippetState;
  /**
   * Methods to interact with the source of the snippet.
   */
  source: SmartSnippetSource;
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
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `SmartSnippet` controller.
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

/**
 * Creates a `SmartSnippet` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `SmartSnippet` properties.
 * @returns A `SmartSnippet` controller instance.
 * */
export function buildSmartSnippet(
  engine: SearchEngine,
  props?: SmartSnippetProps
): SmartSnippet {
  if (!loadSmartSnippetReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const getState = () => engine.state;

  const getResult = () => {
    const {contentIdKey, contentIdValue} =
      getState().search.response.questionAnswer.documentId;
    return engine.state.search.results.find(
      (result) => getResultProperty(result, contentIdKey) === contentIdValue
    );
  };

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
      engine.dispatch(logOpenSmartSnippetSource(result));
      engine.dispatch(pushRecentResult(result));
    }
  );

  return {
    ...controller,

    get state() {
      const state = getState();
      return {
        question: state.search.response.questionAnswer.question,
        answer: state.search.response.questionAnswer.answerSnippet,
        documentId: state.search.response.questionAnswer.documentId,
        expanded: state.questionAnswering.expanded,
        answerFound: state.search.response.questionAnswer.answerSnippet !== '',
        liked: state.questionAnswering.liked,
        disliked: state.questionAnswering.disliked,
        feedbackModalOpen: state.questionAnswering.feedbackModalOpen,
        source: getResult(),
      };
    },

    source: {
      select() {
        interactiveResult.select();
      },
      beginDelayedSelect() {
        interactiveResult.beginDelayedSelect();
      },
      cancelPendingSelect() {
        interactiveResult.cancelPendingSelect();
      },
    },

    expand() {
      engine.dispatch(logExpandSmartSnippet());
      engine.dispatch(expandSmartSnippet());
    },
    collapse() {
      engine.dispatch(logCollapseSmartSnippet());
      engine.dispatch(collapseSmartSnippet());
    },
    like() {
      engine.dispatch(logLikeSmartSnippet());
      engine.dispatch(likeSmartSnippet());
    },
    dislike() {
      engine.dispatch(logDislikeSmartSnippet());
      engine.dispatch(dislikeSmartSnippet());
    },
    openFeedbackModal() {
      engine.dispatch(logOpenSmartSnippetFeedbackModal());
      engine.dispatch(openFeedbackModal());
    },
    closeFeedbackModal() {
      engine.dispatch(logCloseSmartSnippetFeedbackModal());
      engine.dispatch(closeFeedbackModal());
    },
    sendFeedback(feedback) {
      engine.dispatch(logSmartSnippetFeedback(feedback));
      engine.dispatch(closeFeedbackModal());
    },
    sendDetailedFeedback(details) {
      engine.dispatch(logSmartSnippetDetailedFeedback(details));
      engine.dispatch(closeFeedbackModal());
    },
  };
}

function loadSmartSnippetReducers(
  engine: SearchEngine
): engine is SearchEngine<QuestionAnsweringSection> {
  engine.addReducers({search, questionAnswering});
  return true;
}
