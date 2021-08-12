import {buildController, Controller} from '../controller/headless-controller';
import {search, recentQueries} from '../../app/reducers';
import {loadReducerError} from '../../utils/errors';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {RecentQueriesSection} from '../../state/state-sections';
import {RecentQueriesState} from '../../features/recent-queries/recent-queries-state';
import {clearRecentQueries} from '../../features/recent-queries/recent-queries-actions';

/**
 * The `RecentQueriesList` controller is in charge of managing the userès recent queries.
 */
export interface RecentQueriesList extends Controller {
  /**
   * The state of the SmartSnippetQuestionsList controller.
   * */
  state: RecentQueriesState;
  /**
   * Expand the specified snippet suggestion.
   *
   * @param identifier - The identifier of a document used to create the smart snippet.
   */
  clear(): void;
  /**
   * Collapse the specified snippet suggestion.
   *
   * @param identifier - The identifier of a document used to create the smart snippet.
   */
  executeRecentQuery(query: string): void;
}

/**
 * Creates a `SmartSnippetQuestionsList` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `SmartSnippetQuestionsList` controller instance.
 * */
export function buildSmartSnippetQuestionsList(
  engine: SearchEngine
): RecentQueriesList {
  if (!loadRecentQueriesListReducer(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const getState = () => engine.state;

  return {
    ...controller,

    get state() {
      const state = getState();

      return state.recentQueries;
    },

    clear() {
      engine.dispatch(clearRecentQueries());
      engine.dispatch(expandSmartSnippetRelatedQuestion(documentId));
    },
    collapse(documentId: QuestionAnswerDocumentIdentifier) {
      engine.dispatch(logCollapseSmartSnippetSuggestion(documentId));
      engine.dispatch(collapseSmartSnippetRelatedQuestion(documentId));
    },
  };
}

function loadRecentQueriesListReducer(
  engine: SearchEngine
): engine is SearchEngine<RecentQueriesSection> {
  engine.addReducers({search, recentQueries});
  return true;
}
