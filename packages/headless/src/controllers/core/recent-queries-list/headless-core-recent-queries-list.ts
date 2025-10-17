import {
  ArrayValue,
  BooleanValue,
  isBoolean,
  NumberValue,
  Schema,
  StringValue,
} from '@coveo/bueno';
import type {CoreEngine} from '../../../app/engine.js';
import type {UpdateQueryActionCreatorPayload} from '../../../features/query/query-actions.js';
import {queryReducer as query} from '../../../features/query/query-slice.js';
import {
  clearRecentQueries,
  registerRecentQueries,
} from '../../../features/recent-queries/recent-queries-actions.js';
import {recentQueriesReducer as recentQueries} from '../../../features/recent-queries/recent-queries-slice.js';
import {
  type PrepareForSearchWithQueryOptions,
  prepareForSearchWithQuery,
} from '../../../features/search/search-actions.js';
import {searchReducer as search} from '../../../features/search/search-slice.js';
import type {
  ConfigurationSection,
  RecentQueriesSection,
  SearchSection,
} from '../../../state/state-sections.js';
import {loadReducerError} from '../../../utils/errors.js';
import {
  validateInitialState,
  validateOptions,
} from '../../../utils/validate-payload.js';
import {
  buildController,
  type Controller,
} from '../../controller/headless-controller.js';

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
 *
 * Example: [recent-queries.fn.tsx](https://github.com/coveo/ui-kit/blob/main/packages/samples/headless-react/src/components/recent-queries/recent-queries.fn.tsx)
 *
 * @group Controllers
 * @category RecentQueriesList
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
  /**
   * Sets the recent queries list to the specified array of queries.
   * @param queries - The array of queries to set.
   */
  updateRecentQueries(queries: string[]): void;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `RecentQueriesList` controller.
 *
 * @group Controllers
 * @category RecentQueriesList
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
   * When analyticsEnabled is `false`, it is recommended not to save recent queries.
   */
  analyticsEnabled: boolean;
}

function validateRecentQueriesProps(
  engine: CoreEngine,
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
 *
 * @group Controllers
 * @category RecentQueriesList
 * */
export function buildCoreRecentQueriesList(
  engine: CoreEngine,
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
      dispatch(clearRecentQueries());
    },

    updateRecentQueries(queries: string[]) {
      const errorMessage = new ArrayValue({
        required: true,
        each: new StringValue({required: true}),
        min: 1,
      }).validate(queries);
      if (errorMessage) {
        throw new Error(errorMessage);
      }

      dispatch(
        registerRecentQueries({
          queries,
          maxLength: registrationOptions.maxLength,
        })
      );
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
    },
  };
}

function loadRecentQueriesListReducer(
  engine: CoreEngine
): engine is CoreEngine<
  RecentQueriesSection & ConfigurationSection & SearchSection
> {
  engine.addReducers({search, recentQueries, query});
  return true;
}
