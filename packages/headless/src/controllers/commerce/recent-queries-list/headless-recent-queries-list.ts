import {
  ArrayValue,
  BooleanValue,
  NumberValue,
  Schema,
  StringValue,
} from '@coveo/bueno';
import type {CommerceEngine} from '../../../app/commerce-engine/commerce-engine.js';
import {stateKey} from '../../../app/state-key.js';
import type {UpdateQueryPayload} from '../../../features/commerce/query/query-actions.js';
import {
  clearRecentQueries,
  registerRecentQueries,
} from '../../../features/commerce/recent-queries/recent-queries-actions.js';
import {recentQueriesReducer as recentQueries} from '../../../features/commerce/recent-queries/recent-queries-slice.js';
import {
  executeSearch,
  type PrepareForSearchWithQueryOptions,
  prepareForSearchWithQuery,
} from '../../../features/commerce/search/search-actions.js';
import {commerceSearchReducer as search} from '../../../features/commerce/search/search-slice.js';
import type {RecentQueriesSection} from '../../../state/state-sections.js';
import {loadReducerError} from '../../../utils/errors.js';
import {
  validateInitialState,
  validateOptions,
} from '../../../utils/validate-payload.js';
import {
  buildController,
  type Controller,
} from '../../controller/headless-controller.js';
import type {
  RecentQueriesListInitialState,
  RecentQueriesListOptions,
  RecentQueriesListProps,
} from '../../recent-queries-list/headless-recent-queries-list.js';

export type {
  RecentQueriesListProps,
  RecentQueriesListInitialState,
  RecentQueriesListOptions,
};
const defaultRecentQueriesState: Required<RecentQueriesListInitialState> = {
  queries: [],
};

const defaultRecentQueriesOptions: Required<RecentQueriesListOptions> = {
  maxLength: 10,
  clearFilters: true,
};

const initialStateSchema = new Schema<RecentQueriesListInitialState>({
  queries: new ArrayValue({required: true}),
});

const optionsSchema = new Schema<RecentQueriesListOptions>({
  maxLength: new NumberValue({required: true, min: 1}),
  clearFilters: new BooleanValue(),
});

/**
 * The `RecentQueriesList` controller manages the user's recent queries.
 *
 * @group Buildable controllers
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
 * @group Buildable controllers
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
   * Whether analytics and tracking are enabled.
   * In the case where it is disabled, it is recommended not to save recent queries.
   */
  analyticsEnabled: boolean;
}

function validateRecentQueriesProps(
  engine: CommerceEngine,
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
 * @group Buildable controllers
 * @category RecentQueriesList
 *
 * */
export function buildRecentQueriesList(
  engine: CommerceEngine,
  props?: RecentQueriesListProps
): RecentQueriesList {
  if (!loadRecentQueriesListReducer(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;
  const getState = () => engine[stateKey];

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

      const queryOptions: UpdateQueryPayload &
        PrepareForSearchWithQueryOptions = {
        query: this.state.queries[index],
        clearFilters: registrationOptions.clearFilters,
      };

      dispatch(prepareForSearchWithQuery(queryOptions));
      dispatch(executeSearch());
    },
  };
}

function loadRecentQueriesListReducer(
  engine: CommerceEngine
): engine is CommerceEngine<RecentQueriesSection> {
  engine.addReducers({search, recentQueries});
  return true;
}
