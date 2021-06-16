import {buildController, Controller} from '../controller/headless-controller';
import {search} from '../../app/reducers';
import {loadReducerError} from '../../utils/errors';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {QuestionAnswerDocumentIdentifier} from '../../api/search/search/question-answering';

/**
 * The `SmartSnippetQuestionsList` controller allows to manage additional queries for which a SmartSnippet model can provide relevant excerpts.
 */
export interface SmartSnippetQuestionsList extends Controller {
  /**
   * The state of the SmartSnippetQuestionsList controller.
   * */
  state: SmartSnippetQuestionsListState;
  /**
   * Expand the specified snippet suggestion.
   */
  expand(identifier: QuestionAnswerDocumentIdentifier): void;
  /**
   * Collapse the specified snippet suggestion.
   */
  collapse(identifier: QuestionAnswerDocumentIdentifier): void;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `SmartSnippetQuestionsList` controller.
 */
export interface SmartSnippetQuestionsListState {
  /**
   * The related questions for the current query
   */
  relatedQuestions: SmartSnippetRelatedQuestion[];
}

export interface SmartSnippetRelatedQuestion {
  /**
   * The question related to the smart snippet.
   */
  question: string;
  /**
   * The answer, or snippet, related to the question.
   *
   * This can contain HTML markup, depending on the source of the answer.
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
}

/**
 * Creates a `SmartSnippetQuestionsList` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `SmartSnippetQuestionsList` controller instance.
 * */
export function buildSmartSnippetQuestionsList(
  engine: SearchEngine
): SmartSnippetQuestionsList {
  if (!loadSmartSnippetQuestionsListReducer(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);

  return {
    ...controller,

    get state() {
      return {
        // TODO
      } as SmartSnippetQuestionsListState;
    },

    expand(_: QuestionAnswerDocumentIdentifier) {
      // TODO
    },
    collapse(_: QuestionAnswerDocumentIdentifier) {
      // TODO
    },
  };
}

function loadSmartSnippetQuestionsListReducer(
  engine: SearchEngine
): engine is SearchEngine {
  engine.addReducers({search});
  return true;
}
