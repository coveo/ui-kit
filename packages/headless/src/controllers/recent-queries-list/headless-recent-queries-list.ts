import {buildController, Controller} from '../controller/headless-controller';
import {search, recentQueries} from '../../app/reducers';
import {loadReducerError} from '../../utils/errors';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {RecentQueriesSection} from '../../state/state-sections';
import {RecentQueriesState} from '../../features/recent-queries/recent-queries-state';
import {
  clearRecentQueries,
  registerRecentQueries,
} from '../../features/recent-queries/recent-queries-actions';
import {
  validateInitialState,
  validateOptions,
} from '../../utils/validate-payload';
import {ArrayValue, NumberValue, Schema} from '../../../../bueno/dist';
import {executeSearch} from '../../features/search/search-actions';
import {updateQuery} from '../../features/query/query-actions';
import {
  logClearRecentQueries,
  logRecentQueryClick,
} from '../../features/recent-queries/recent-queries-analytics-actions';

export interface RecentQueriesListProps {
  /**
   * The initial state that should be applied to the `RecentQueriesList` controller.
   */
  initialState?: RecentQueriesListInitialState;
  /**
   * The configuration options that should be applied to the `RecentQueriesList` controller.
   */
  options?: RecentQueriesListOptions;
}

export interface RecentQueriesListInitialState {
  /**
   * The list of recent queries
   * @defaultValue `[]`
   */
  queries: string[];
}

const initialStateSchema = new Schema<Required<RecentQueriesListInitialState>>({
  queries: new ArrayValue({required: false}),
});

export interface RecentQueriesListOptions {
  /**
   * The maximum number of queries to retain in the list.
   * @defaultValue `10`
   */
  maxQueries: number;
}

const optionsSchema = new Schema<Required<RecentQueriesListOptions>>({
  maxQueries: new NumberValue({required: false}),
});

/**
 * The `RecentQueriesList` controller is in charge of managing the userès recent queries.
 */
export interface RecentQueriesList extends Controller {
  /**
   * The state of the RecentQueriesList controller.
   * */
  state: RecentQueriesState;
  /**
   * Clear the recent queries lsit.
   */
  clear(): void;
  /**
   * Execute the given recent query.
   *
   * @param query - The recent query to execute.
   */
  executeRecentQuery(query: string): void;
}

export function validateRecentQueriesProps(
  engine: SearchEngine,
  props: RecentQueriesListProps
) {
  validateOptions(
    engine,
    optionsSchema,
    props.options,
    'buildRecentQueriesList'
  );
  validateInitialState(
    engine,
    initialStateSchema,
    props.initialState,
    'buildRecentQueriesList'
  );
}

/**
 * Creates a `RecentQueriesList` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configuration `RecentQueriesList` properties.
 * @returns A `RecentQueriesList` controller instance.
 * */
export function buildRecentQueriesList(
  engine: SearchEngine,
  props: RecentQueriesListProps
): RecentQueriesList {
  if (!loadRecentQueriesListReducer(engine)) {
    throw loadReducerError;
  }

  const dispatch = engine.dispatch;

  validateRecentQueriesProps(engine, props);
  dispatch(
    registerRecentQueries({
      queries: props.initialState?.queries ?? [],
      maxQueries: props.options?.maxQueries ?? 10,
    })
  );

  const controller = buildController(engine);
  const getState = () => engine.state;

  return {
    ...controller,

    get state() {
      const state = getState();

      return state.recentQueries;
    },

    clear() {
      dispatch(logClearRecentQueries());
      dispatch(clearRecentQueries());
    },

    executeRecentQuery(value: string) {
      dispatch(updateQuery({q: value}));
      dispatch(executeSearch(logRecentQueryClick()));
    },
  };
}

function loadRecentQueriesListReducer(
  engine: SearchEngine
): engine is SearchEngine<RecentQueriesSection> {
  engine.addReducers({search, recentQueries});
  return true;
}
