import {ArrayValue, BooleanValue, NumberValue, Schema} from '@coveo/bueno';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {UpdateQueryActionCreatorPayload} from '../../../features/commerce/query/query-actions';
import {recentQueriesReducer as recentQueries} from '../../../features/commerce/recent-queries/recent-queries-slice';
import {
  PrepareForSearchWithQueryOptions,
  executeSearch,
  prepareForSearchWithQuery,
} from '../../../features/commerce/search/search-actions';
import {commerceSearchReducer as search} from '../../../features/commerce/search/search-slice';
import {
  clearRecentQueries,
  registerRecentQueries,
} from '../../../features/recent-queries/recent-queries-actions';
import {RecentQueriesSection} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {
  validateInitialState,
  validateOptions,
} from '../../../utils/validate-payload';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';
import type {
  RecentQueriesListInitialState,
  RecentQueriesListOptions,
  RecentQueriesListProps,
} from '../../recent-queries-list/headless-recent-queries-list';

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
 * @internal
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
