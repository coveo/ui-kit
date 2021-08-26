import {ArrayValue, NumberValue, Schema} from '@coveo/bueno';
import {buildController, Controller} from '../controller/headless-controller';
import {search, recentQueries} from '../../app/reducers';
import {loadReducerError} from '../../utils/errors';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {RecentQueriesSection} from '../../state/state-sections';
import {
  clearRecentQueries,
  registerRecentQueries,
} from '../../features/recent-queries/recent-queries-actions';
import {
  validateInitialState,
  validateOptions,
} from '../../utils/validate-payload';
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

const defaultRecentQueriesProps: Required<RecentQueriesListProps> = {
  initialState: {
    queries: [],
  },
  options: {
    maxLength: 10,
  },
};

export interface RecentQueriesListInitialState {
  /**
   * The list of recent queries.
   * @defaultValue `[]`
   */
  queries: string[];
}

const initialStateSchema = new Schema<RecentQueriesListInitialState>({
  queries: new ArrayValue({required: true}),
});

export interface RecentQueriesListOptions {
  /**
   * The maximum number of queries to retain in the list.
   * @defaultValue `10`
   */
  maxLength: number;
}

const optionsSchema = new Schema<RecentQueriesListOptions>({
  maxLength: new NumberValue({required: true, min: 1}),
});

/**
 * The `RecentQueriesList` controller manages the user's recent queries.
 */
export interface RecentQueriesList extends Controller {
  /**
   * The state of the RecentQueriesList controller.
   * */
  state: RecentQueriesState;
  /**
   * Clears the recent queries list.
   */
  clear(): void;
  /**
   * Executes the given recent query.
   * @param index - The index of the recent query to execute.
   */
  executeRecentQuery(index: number): void;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `RecentQueriesList` controller.
 * */
export interface RecentQueriesState {
  /**
   * The list of recent queries.
   */
  queries: string[];
  /**
   * The maximum number of queries to retain in the list.
   */
  maxLength: number;
}

export function validateRecentQueriesProps(
  engine: SearchEngine,
  props?: RecentQueriesListProps
) {
  validateOptions(
    engine,
    optionsSchema,
    props?.options,
    'buildRecentQueriesList'
  );
  validateInitialState(
    engine,
    initialStateSchema,
    props?.initialState,
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
  props?: RecentQueriesListProps
): RecentQueriesList {
  if (!loadRecentQueriesListReducer(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;
  const getState = () => engine.state;

  const registrationProps: Required<RecentQueriesListProps> = {
    ...defaultRecentQueriesProps,
    ...props,
  };

  validateRecentQueriesProps(engine, registrationProps);

  const options = {
    queries: registrationProps.initialState.queries,
    maxLength: registrationProps.options.maxLength,
  };

  dispatch(registerRecentQueries(options));

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

    executeRecentQuery(index: number) {
      const errorMessage = new NumberValue({
        required: true,
        min: 0,
        max: this.state.queries.length,
      }).validate(index);
      if (errorMessage) {
        throw new Error(errorMessage);
      }
      dispatch(updateQuery({q: this.state.queries[index]}));
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
