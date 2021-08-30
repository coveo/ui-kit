import {ArrayValue, NumberValue, Schema} from '@coveo/bueno';
import {buildController, Controller} from '../controller/headless-controller';
import {loadReducerError} from '../../utils/errors';
import {recentResults} from '../../app/reducers';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {RecentResultsSection} from '../../state/state-sections';
import {
  clearRecentResults,
  registerRecentResults,
} from '../../features/recent-results/recent-results-actions';
import {
  validateInitialState,
  validateOptions,
} from '../../utils/validate-payload';
import {logClearRecentResults} from '../../features/recent-results/recent-results-analytics-actions';
import {Result} from '../../api/search/search/result';

export interface RecentResultsListProps {
  /**
   * The initial state that should be applied to the `RecentResultsList` controller.
   */
  initialState?: RecentResultsListInitialState;
  /**
   * The configuration options that should be applied to the `RecentResultsList` controller.
   */
  options?: RecentResultsListOptions;
}

const defaultRecentResultsProps: Required<RecentResultsListProps> = {
  initialState: {
    results: [],
  },
  options: {
    maxLength: 10,
  },
};

export interface RecentResultsListInitialState {
  /**
   * The list of recent results.
   * @defaultValue `[]`
   */
  results: Result[];
}

const initialStateSchema = new Schema<RecentResultsListInitialState>({
  results: new ArrayValue({required: true}),
});

export interface RecentResultsListOptions {
  /**
   * The maximum number of results to retain in the list.
   * @defaultValue `10`
   */
  maxLength: number;
}

const optionsSchema = new Schema<RecentResultsListOptions>({
  maxLength: new NumberValue({required: true, min: 1}),
});

/**
 * The `RecentResultsList` controller manages the user's recent results.
 */
export interface RecentResultsList extends Controller {
  /**
   * The state of the RecentResultsList controller.
   * */
  state: RecentResultsState;
  /**
   * Clears the recent results list.
   */
  clear(): void;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `RecentResultsList` controller.
 * */
export interface RecentResultsState {
  /**
   * The list of recent results.
   */
  results: Result[];
  /**
   * The maximum number of results to retain in the list.
   */
  maxLength: number;
}

export function validateRecentResultsProps(
  engine: SearchEngine,
  props?: RecentResultsListProps
) {
  validateOptions(
    engine,
    optionsSchema,
    props?.options,
    'buildRecentResultsList'
  );
  validateInitialState(
    engine,
    initialStateSchema,
    props?.initialState,
    'buildRecentResultsList'
  );
}

/**
 * Creates a `RecentResultsList` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configuration `RecentResultsList` properties.
 * @returns A `RecentResultsList` controller instance.
 * */
export function buildRecentResultsList(
  engine: SearchEngine,
  props?: RecentResultsListProps
): RecentResultsList {
  if (!loadRecentResultsListReducer(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;
  const getState = () => engine.state;

  const registrationProps: Required<RecentResultsListProps> = {
    ...defaultRecentResultsProps,
    ...props,
  };

  validateRecentResultsProps(engine, registrationProps);

  const options = {
    results: registrationProps.initialState.results,
    maxLength: registrationProps.options.maxLength,
  };

  dispatch(registerRecentResults(options));

  return {
    ...controller,

    get state() {
      return getState().recentResults;
    },

    clear() {
      dispatch(logClearRecentResults());
      dispatch(clearRecentResults());
    },
  };
}

function loadRecentResultsListReducer(
  engine: SearchEngine
): engine is SearchEngine<RecentResultsSection> {
  engine.addReducers({recentResults});
  return true;
}
