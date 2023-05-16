import {BooleanValue, Schema} from '@coveo/bueno';
import {configuration} from '../../../app/common-reducers';
import {CoreEngine} from '../../../app/engine';
import {getConfigurationInitialState} from '../../../features/configuration/configuration-state';
import {
  registerTab,
  updateActiveTab,
} from '../../../features/tab-set/tab-set-actions';
import {tabSetReducer as tabSet} from '../../../features/tab-set/tab-set-slice';
import {ConfigurationSection, TabSection} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {
  requiredEmptyAllowedString,
  requiredNonEmptyString,
  validateInitialState,
  validateOptions,
} from '../../../utils/validate-payload';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';

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
 * The `Tab` headless controller offers a high-level interface for designing a common tab UI controller.
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
   * Indicates whether the current tab is selected.
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
export function buildCoreTab(engine: CoreEngine, props: TabProps): Tab {
  assertIdNotEqualToDefaultOriginLevel2(props.options.id);

  if (!loadTabReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;

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
    },

    get state() {
      const isActive = engine.state.tabSet[id]?.isActive;
      return {
        isActive,
      };
    },
  };
}

function loadTabReducers(
  engine: CoreEngine
): engine is CoreEngine<ConfigurationSection & TabSection> {
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
