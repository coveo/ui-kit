import {Engine} from '../../app/headless-engine';
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
  query: string | null;
}

/**
 * Creates a `QueryTrigger` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `QueryTrigger` controller instance.
 * */
export function buildQueryTrigger(engine: Engine<object>): QueryTrigger {
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
        if (this.state.query) {
          listener();
          const updateQueryPayload: UpdateQueryActionCreatorPayload = {
            q: this.state.query,
          };
          dispatch(updateQuery(updateQueryPayload));
          //maybe logSearchBoxSubmit instead
          //and dispatch logQueryTrigger  separately?
          dispatch(executeSearch(logQueryTrigger()));
        }
      };
      strictListener();
      return engine.subscribe(strictListener);
    },

    get state() {
      return {
        query: getState().triggers.query,
      };
    },
  };
}

function loadQueryTriggerReducers(
  engine: Engine<object>
): engine is Engine<TriggerSection & ConfigurationSection> {
  engine.addReducers({configuration, triggers});
  return true;
}
