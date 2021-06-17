import {Engine} from '../../app/headless-engine';
import {buildController, Controller} from '../controller/headless-controller';
import {search} from '../../app/reducers';
import {loadReducerError} from '../../utils/errors';
import {SearchSection} from '../../state/state-sections';
import {QuestionAnswerDocumentIdentifier} from '../../api/search/search/question-answering';
export {QuestionAnswerDocumentIdentifier} from '../../api/search/search/question-answering';
import {
  logCollapseSmartSnippet,
  logDislikeSmartSnippet,
  logExpandSmartSnippet,
  logLikeSmartSnippet,
} from '../../features/question-answering/question-answering-analytics-actions';

/**
 * The `SmartSnippet` controller allows to manage the excerpt of a document that would be most likely to answer a particular query .
 */
export interface SmartSnippet extends Controller {
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
  thumbsUp(): void;
  /**
   * Allows the user to signal that a particular answer was not relevant.
   */
  thumbsDown(): void;
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
}

/**
 * Creates a `SmartSnippet` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `SmartSnippet` controller instance.
 * */
export function buildSmartSnippet(engine: Engine<object>): SmartSnippet {
  if (!loadSmartSnippetReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);

  return {
    ...controller,

    get state() {
      return {
        // TODO
      } as SmartSnippetState;
    },

    expand() {
      engine.dispatch(logExpandSmartSnippet());
      // TODO manage state expanded
    },
    collapse() {
      engine.dispatch(logCollapseSmartSnippet());
      // TODO manage state expanded
    },
    thumbsUp() {
      engine.dispatch(logLikeSmartSnippet());
      // TODO manage state liked
    },
    thumbsDown() {
      engine.dispatch(logDislikeSmartSnippet());
      // TODO manage state disliked
    },
  };
}

function loadSmartSnippetReducers(
  engine: Engine<object>
): engine is Engine<SearchSection> {
  engine.addReducers({search});
  return true;
}
