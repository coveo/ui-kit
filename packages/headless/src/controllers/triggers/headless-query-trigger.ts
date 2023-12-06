import {SearchAnalyticsProvider} from '../../api/analytics/search-analytics';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {SearchPageEvents} from '../../features/analytics/search-action-cause';
import {updateQuery} from '../../features/query/query-actions';
import {queryReducer as query} from '../../features/query/query-slice';
import {executeSearch} from '../../features/search/search-actions';
import {logUndoTriggerQuery} from '../../features/triggers/trigger-analytics-actions';
import {updateIgnoreQueryTrigger} from '../../features/triggers/triggers-actions';
import {triggerReducer as triggers} from '../../features/triggers/triggers-slice';
import {TriggerSection, QuerySection} from '../../state/state-sections';
import {loadReducerError} from '../../utils/errors';
import {buildController, Controller} from '../controller/headless-controller';

/**
 * The `QueryTrigger` controller handles query triggers.
 */
export interface QueryTrigger extends Controller {
  /**
   * The state of the `QueryTrigger` controller.
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

  const modification = () => getState().triggers.queryModification.newQuery;
  const originalQuery = () =>
    getState().triggers.queryModification.originalQuery;

  return {
    ...controller,

    get state() {
      return {
        newQuery: modification(),
        originalQuery: originalQuery(),
        wasQueryModified: modification() !== '',
      };
    },

    undo() {
      dispatch(updateIgnoreQueryTrigger(modification()));
      dispatch(updateQuery({q: originalQuery()}));
      dispatch(
        executeSearch({
          legacy: logUndoTriggerQuery({
            undoneQuery: modification(),
          }),
          next: {
            actionCause: SearchPageEvents.undoTriggerQuery,
            getEventExtraPayload: () =>
              new SearchAnalyticsProvider(getState).getUndoTriggerQueryMetadata(
                modification()
              ),
          },
        })
      );
    },
  };
}

function loadQueryTriggerReducers(
  engine: SearchEngine
): engine is SearchEngine<TriggerSection & QuerySection> {
  engine.addReducers({triggers, query});
  return true;
}
