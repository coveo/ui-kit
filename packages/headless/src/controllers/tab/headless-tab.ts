import {Engine} from '../../app/headless-engine';
import {buildController, Controller} from '../controller/headless-controller';
import {executeSearch} from '../../features/search/search-actions';
import {logInterfaceChange} from '../../features/analytics/analytics-actions';
import {
  registerAdvancedSearchQueries,
  updateAdvancedSearchQueries,
} from '../../features/advanced-search-queries/advanced-search-queries-actions';
import {
  AdvancedSearchQueriesSection,
  ConfigurationSection,
} from '../../state/state-sections';
import {BooleanValue, Schema, StringValue} from '@coveo/bueno';
import {
  validateInitialState,
  validateOptions,
} from '../../utils/validate-payload';
import {advancedSearchQueries, configuration} from '../../app/reducers';
import {loadReducerError} from '../../utils/errors';

export interface TabOptions {
  /**
   * A constant query expression or filter that the Tab should add to any outgoing query.
   *
   * **Example:**
   *
   * `@objecttype==Message`
   */
  expression: string;
}

export interface TabInitialState {
  /**
   * Specifies if the tab is currently selected.
   * Note that there can be only one active tab for a given headless engine.
   */
  isActive: boolean;
}

const optionsSchema = new Schema({
  expression: new StringValue(),
});

const initialStateSchema = new Schema({
  isActive: new BooleanValue(),
});

export interface TabProps {
  /**
   * The options for the `Tab` controller.
   */
  options: TabOptions;
  /**
   * The initial state that should be applied to this `Tab` controller.
   */
  initialState?: TabInitialState;
}

/**
 * The `Tab` headless controller allows the end user to view a subset of results.
 * It is in charge of adding a constant expression to the outgoing query in order to refine the results.
 */
export interface Tab extends Controller {
  /**
   * Activates the tab.
   */
  select(): void;

  /**
   * The state of the `Tab` controller.
   */
  state: TabState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `Tab` controller.
 */
export interface TabState {
  /**
   * `true` if the current tab is selected and `false` otherwise.
   * */
  isActive: boolean;
}

/**
 * Creates a `Tab` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `Tab` properties.
 * @returns A `Tab` controller instance.
 */
export function buildTab(engine: Engine<unknown>, props: TabProps): Tab {
  if (!loadTabReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;
  const getState = () => engine.state;

  const options = validateOptions(
    engine,
    optionsSchema,
    props.options,
    'buildTab'
  );
  const initialState = validateInitialState(
    engine,
    initialStateSchema,
    props.initialState,
    'buildTab'
  );

  if (initialState.isActive) {
    dispatch(registerAdvancedSearchQueries({cq: options.expression}));
  }

  return {
    ...controller,

    select() {
      dispatch(updateAdvancedSearchQueries({cq: options.expression}));
      dispatch(executeSearch(logInterfaceChange()));
    },

    get state() {
      const isActive =
        getState().advancedSearchQueries.cq === options.expression;
      return {
        isActive,
      };
    },
  };
}

function loadTabReducers(
  engine: Engine<unknown>
): engine is Engine<ConfigurationSection & AdvancedSearchQueriesSection> {
  engine.addReducers({configuration, advancedSearchQueries});
  return true;
}
