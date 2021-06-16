import {buildController, Controller} from '../controller/headless-controller';
import {search} from '../../app/reducers';
import {loadReducerError} from '../../utils/errors';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {QuestionAnswerDocumentIdentifier} from '../../api/search/search/question-answering';

/**
 * The `SmartSnippetSuggestions` controller allows to manage additional queries for which a SmartSnippet model can provide relevant excerpts.
 */
export interface SmartSnippetSuggestions extends Controller {
  /**
   * The state of the SmartSnippet controller.
   * */
  state: SmartSnippetSuggestionsState;
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
 * A scoped and simplified part of the headless state that is relevant to the `SmartSnippet` controller.
 */
export interface SmartSnippetSuggestionsState {
  /**
   * The related questions for the current query
   */
  relatedQuestions: SmartSnippetSuggestionsRelatedQuestions[];
}

export interface SmartSnippetSuggestionsRelatedQuestions {
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
 * Creates a `SmartSnippet` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `SmartSnippet` controller instance.
 * */
export function buildSmartSnippetSuggestions(
  engine: SearchEngine
): SmartSnippetSuggestions {
  if (!loadSmartSnippetSuggestionsReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);

  return {
    ...controller,

    get state() {
      return {
        // TODO
      } as SmartSnippetSuggestionsState;
    },

    expand(_: QuestionAnswerDocumentIdentifier) {
      // TODO
    },
    collapse(_: QuestionAnswerDocumentIdentifier) {
      // TODO
    },
  };
}

function loadSmartSnippetSuggestionsReducers(
  engine: SearchEngine
): engine is SearchEngine {
  engine.addReducers({search});
  return true;
}
