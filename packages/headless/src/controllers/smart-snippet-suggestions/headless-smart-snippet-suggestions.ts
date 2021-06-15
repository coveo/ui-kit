import {Engine} from '../../app/headless-engine';
import {buildController, Controller} from '../controller/headless-controller';
import {search} from '../../app/reducers';
import {loadReducerError} from '../../utils/errors';
import {SearchSection} from '../../state/state-sections';

export interface SmartSnippetSuggestionsDocumentId {
  contentIdKey: string;
  contentItValue: string;
}

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
  expand(identifier: SmartSnippetSuggestionsDocumentId): void;
  /**
   * Collapse the specified snippet suggestion.
   */
  collapse(identifier: SmartSnippetSuggestionsDocumentId): void;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `SmartSnippet` controller.
 */
export interface SmartSnippetSuggestionsState {
  /**
   * The related questions for the current query
   */
  relatedQuestions: {
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
    documentId: SmartSnippetSuggestionsDocumentId;
    /**
     * Determines if the snippet is currently expanded.
     */
    expanded: boolean;
  }[];
}

/**
 * Creates a `SmartSnippet` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `SmartSnippet` controller instance.
 * */
export function buildSmartSnippetSuggestions(
  engine: Engine<object>
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

    expand(_: SmartSnippetSuggestionsDocumentId) {
      // TODO
    },
    collapse(_: SmartSnippetSuggestionsDocumentId) {
      // TODO
    },
  };
}

function loadSmartSnippetSuggestionsReducers(
  engine: Engine<object>
): engine is Engine<SearchSection> {
  engine.addReducers({search});
  return true;
}
