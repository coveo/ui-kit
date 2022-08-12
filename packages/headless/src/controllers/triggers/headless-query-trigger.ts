import {SearchEngine} from '../../app/search-engine/search-engine';
import {TriggerSection, QuerySection} from '../../state/state-sections';
import {triggers, query} from '../../app/reducers';
import {buildController, Controller} from '../controller/headless-controller';
import {loadReducerError} from '../../utils/errors';
import {executeSearch} from '../../features/search/search-actions';
import {
  updateQuery,
  UpdateQueryActionCreatorPayload,
} from '../../features/query/query-actions';
import {
  logTriggerQuery,
  logUndoTriggerQuery,
} from '../../features/triggers/trigger-analytics-actions';

/**
 * The `QueryTrigger` controller handles query triggers.
 */
export interface QueryTrigger extends Controller {
  /**
   * the state of the `QueryTrigger` controller.
   */
  state: QueryTriggerState;
  /**
   * Undoes a query trigger's correction.
   */
  undo(): void;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `QueryTrigger` controller.
 */
export interface QueryTriggerState {
  /**
   * The new query to perform a search with after receiving a query trigger.
   */
  newQuery: string;

  /**
   * The query used to perform the search that received a query trigger in its response.
   */
  originalQuery: string;

  /**
   * A boolean to specify if the controller was triggered resulting in a modification to the query.
   */
  wasQueryModified: boolean;
}

/**
 * Creates a `QueryTrigger` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `QueryTrigger` controller instance.
 * */
export function buildQueryTrigger(engine: SearchEngine): QueryTrigger {
  if (!loadQueryTriggerReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;

  const getState = () => engine.state;

  let correction: {originalQuery: string; newQuery: string} | null = null;
  let queryToIgnore: string | null = null;

  return {
    ...controller,

    subscribe(listener: () => void) {
      const strictListener = () => {
        const currentTrigger = getState().triggers.query;
        const currentQuery = getState().query.q;

        if (currentQuery === queryToIgnore) {
          return;
        }
        queryToIgnore = null;

        if (correction) {
          const wasQueryUndone = currentQuery === correction.originalQuery;
          if (wasQueryUndone) {
            // We don't want a query trigger to immediately redo what the user intends to undo.
            queryToIgnore = currentQuery;
          }

          correction = null;
          listener();
          return;
        }

        if (currentTrigger) {
          correction = {
            originalQuery: currentQuery,
            newQuery: currentTrigger,
          };
          queryToIgnore = currentTrigger;
          const updateQueryPayload: UpdateQueryActionCreatorPayload = {
            q: currentTrigger,
          };
          dispatch(updateQuery(updateQueryPayload));
          listener();
          dispatch(executeSearch(logTriggerQuery()));
          return;
        }
      };
      strictListener();
      return engine.subscribe(strictListener);
    },

    get state() {
      return {
        newQuery: correction?.newQuery ?? '',
        originalQuery: correction?.originalQuery ?? '',
        wasQueryModified: !!correction,
      };
    },

    undo() {
      if (!correction) {
        return;
      }

      const undoneQuery = correction.newQuery;
      const updateQueryPayload: UpdateQueryActionCreatorPayload = {
        q: correction.originalQuery,
      };
      dispatch(updateQuery(updateQueryPayload));
      dispatch(executeSearch(logUndoTriggerQuery({undoneQuery})));
    },
  };
}

function loadQueryTriggerReducers(
  engine: SearchEngine
): engine is SearchEngine<TriggerSection & QuerySection> {
  engine.addReducers({triggers, query});
  return true;
}
