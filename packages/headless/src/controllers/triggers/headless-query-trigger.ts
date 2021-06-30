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
import {logQueryTrigger} from '../../features/triggers/trigger-analytics-actions';

/**
 * The `QueryTrigger` controller handles query triggers.
 */
export interface QueryTrigger extends Controller {
  /**
   * the state of the `QueryTrigger` controller.
   */
  state: QueryTriggerState;
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
  previousQuery: string;
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

  let previousQueryTrigger: string = getState().triggers.query;
  let previousQuery: string = getState().query.q;

  return {
    ...controller,

    subscribe(listener: () => void) {
      const strictListener = () => {
        const hasChanged = previousQueryTrigger !== this.state.newQuery;
        previousQueryTrigger = this.state.newQuery;

        if (hasChanged && getState().triggers.query) {
          const updateQueryPayload: UpdateQueryActionCreatorPayload = {
            q: getState().triggers.query,
          };
          dispatch(updateQuery(updateQueryPayload));
          listener();
          dispatch(executeSearch(logQueryTrigger()));
        }
        previousQuery = getState().query.q;
      };
      strictListener();
      return engine.subscribe(strictListener);
    },

    get state() {
      return {
        newQuery: getState().triggers.query,
        previousQuery: previousQuery,
      };
    },
  };
}

function loadQueryTriggerReducers(
  engine: SearchEngine
): engine is SearchEngine<TriggerSection & QuerySection> {
  engine.addReducers({triggers, query});
  return true;
}
