import {SearchEngine} from '../../app/search-engine/search-engine';
import {ConfigurationSection, TriggerSection} from '../../state/state-sections';
import {configuration, triggers} from '../../app/reducers';
import {buildController, Controller} from '../controller/headless-controller';
import {loadReducerError} from '../../utils/errors';
import {executeSearch} from '../../features/search/search-actions';
import {
  updateQuery,
  UpdateQueryActionCreatorPayload,
} from '../../features/query/query-actions';
import {logQueryTrigger} from '../../features/triggers/trigger-analytics-actions';
import {clearQueryTrigger} from '../../features/triggers/trigger-actions';

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
  newQuery: string | null;

  /**
   * The query used to perform the search that received a query trigger in its response.
   */
  prevQuery: string | undefined;
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

  return {
    ...controller,

    subscribe(listener: () => void) {
      const strictListener = () => {
        if (getState().triggers.query) {
          listener();
          const updateQueryPayload: UpdateQueryActionCreatorPayload = {
            q: getState().triggers.query!,
          };
          dispatch(clearQueryTrigger());
          dispatch(updateQuery(updateQueryPayload));
          dispatch(executeSearch(logQueryTrigger()));
        }
      };
      strictListener();
      return engine.subscribe(strictListener);
    },

    get state() {
      return {
        newQuery: getState().triggers.query,
        prevQuery: getState().query?.q,
      };
    },
  };
}

function loadQueryTriggerReducers(
  engine: SearchEngine
): engine is SearchEngine<TriggerSection & ConfigurationSection> {
  engine.addReducers({configuration, triggers});
  return true;
}
