import {
  ArrayValue,
  BooleanValue,
  NumberValue,
  Schema,
  isBoolean,
} from '@coveo/bueno';
import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {
  clearRecentQueries,
  registerRecentQueries,
} from '../../features/recent-queries/recent-queries-actions.js';
import {
  logClearRecentQueries,
  logRecentQueryClick,
} from '../../features/recent-queries/recent-queries-analytics-actions.js';
import {recentQueriesReducer as recentQueries} from '../../features/recent-queries/recent-queries-slice.js';
import {
  PrepareForSearchWithQueryOptions,
  executeSearch,
  prepareForSearchWithQuery,
} from '../../features/search/search-actions.js';
import {searchReducer as search} from '../../features/search/search-slice.js';
import {UpdateQueryActionCreatorPayload} from '../../ssr.index.js';
import {RecentQueriesSection} from '../../state/state-sections.js';
import {loadReducerError} from '../../utils/errors.js';
import {
  validateInitialState,
  validateOptions,
} from '../../utils/validate-payload.js';
import {
  buildController,
  Controller,
} from '../controller/headless-controller.js';

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

const defaultRecentQueriesState: Required<RecentQueriesListInitialState> = {
  queries: [],
};

const defaultRecentQueriesOptions: Required<RecentQueriesListOptions> = {
  maxLength: 10,
  clearFilters: true,
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
  /**
   * Whether to clear all active query filters when the end user submits a new query from the recent queries list.
   * Setting this option to "false" is not recommended & can lead to an increasing number of queries returning no results.
   */
  clearFilters?: boolean;
}

const optionsSchema = new Schema<RecentQueriesListOptions>({
  maxLength: new NumberValue({required: true, min: 1}),
  clearFilters: new BooleanValue(),
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
  /**
   * Whether analytics & tracking are enabled.
   * In the case where it is disabled, it is recommended not to save recent queries.
   */
  analyticsEnabled: boolean;
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

  const registrationOptions: Required<RecentQueriesListOptions> = {
    ...defaultRecentQueriesOptions,
    ...props?.options,
  };
  const registrationState: Required<RecentQueriesListInitialState> = {
    ...defaultRecentQueriesState,
    ...props?.initialState,
  };

  validateRecentQueriesProps(engine, {
    options: registrationOptions,
    initialState: registrationState,
  });

  const options = {
    queries: registrationState.queries,
    maxLength: registrationOptions.maxLength,
  };

  dispatch(registerRecentQueries(options));

  return {
    ...controller,

    get state() {
      const state = getState();

      return {
        ...state.recentQueries,
        analyticsEnabled: state.configuration.analytics.enabled,
      };
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

      const queryOptions: UpdateQueryActionCreatorPayload &
        PrepareForSearchWithQueryOptions = {
        q: this.state.queries[index],
        clearFilters: registrationOptions.clearFilters,
      };

      if (isBoolean(engine.state.query?.enableQuerySyntax)) {
        queryOptions.enableQuerySyntax = engine.state.query.enableQuerySyntax;
      }

      dispatch(prepareForSearchWithQuery(queryOptions));
      dispatch(
        executeSearch({
          legacy: logRecentQueryClick(),
        })
      );
    },
  };
}

function loadRecentQueriesListReducer(
  engine: SearchEngine
): engine is SearchEngine<RecentQueriesSection> {
  engine.addReducers({search, recentQueries});
  return true;
}
