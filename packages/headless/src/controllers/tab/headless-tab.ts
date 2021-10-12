import {buildController, Controller} from '../controller/headless-controller';
import {executeSearch} from '../../features/search/search-actions';
import {logInterfaceChange} from '../../features/analytics/analytics-actions';
import {ConfigurationSection, TabSection} from '../../state/state-sections';
import {BooleanValue, Schema} from '@coveo/bueno';
import {
  requiredEmptyAllowedString,
  requiredNonEmptyString,
  validateInitialState,
  validateOptions,
} from '../../utils/validate-payload';
import {configuration, tabSet} from '../../app/reducers';
import {loadReducerError} from '../../utils/errors';
import {getConfigurationInitialState} from '../../features/configuration/configuration-state';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {
  registerTab,
  updateActiveTab,
} from '../../features/tab-set/tab-set-actions';

export interface TabOptions {
  /**
   * A constant query expression or filter that the Tab should add to any outgoing query.
   *
   * **Example:**
   *
   * `@objecttype==Message`
   */
  expression: string;

  /**
   * A unique identifier for the tab. The value will be used as the originLevel2 when the tab is active.
   */
  id: string;
}

export interface TabInitialState {
  /**
   * Specifies if the tab is currently selected.
   * Note that there can be only one active tab for a given headless engine.
   */
  isActive: boolean;
}

const optionsSchema = new Schema<Required<TabOptions>>({
  expression: requiredEmptyAllowedString,
  id: requiredNonEmptyString,
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
export function buildTab(engine: SearchEngine, props: TabProps): Tab {
  assertIdNotEqualToDefaultOriginLevel2(props.options.id);

  if (!loadTabReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;
  const getState = () => engine.state;

  validateOptions(engine, optionsSchema, props.options, 'buildTab');
  const initialState = validateInitialState(
    engine,
    initialStateSchema,
    props.initialState,
    'buildTab'
  );

  const {id, expression} = props.options;

  dispatch(registerTab({id, expression}));

  if (initialState.isActive) {
    dispatch(updateActiveTab(id));
  }

  return {
    ...controller,

    select() {
      dispatch(updateActiveTab(id));
      dispatch(executeSearch(logInterfaceChange()));
    },

    get state() {
      const isActive = getState().tabSet[id].isActive;
      return {
        isActive,
      };
    },
  };
}

function loadTabReducers(
  engine: SearchEngine
): engine is SearchEngine<ConfigurationSection & TabSection> {
  engine.addReducers({configuration, tabSet});
  return true;
}

function assertIdNotEqualToDefaultOriginLevel2(id: string | undefined) {
  const defaultOriginLevel2 =
    getConfigurationInitialState().analytics.originLevel2;
  if (id === defaultOriginLevel2) {
    throw new Error(
      `The #id option on the Tab controller cannot use the reserved value "${defaultOriginLevel2}". Please specify a different value.`
    );
  }
}
