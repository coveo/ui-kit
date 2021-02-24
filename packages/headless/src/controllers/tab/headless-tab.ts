import {Engine} from '../../app/headless-engine';
import {buildController} from '../controller/headless-controller';
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

export type TabOptions = {
  /**
   * A constant query expression or filter that the Tab should add to any outgoing query.
   *
   * **Example:**
   *
   * `@objecttype==Message`
   */
  expression: string;
};

export type TabInitialState = {
  /**
   * Specifies if the tab is currently selected.
   * Note that there can be only one active tab for a given headless engine.
   */
  isActive: boolean;
};

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
export type Tab = ReturnType<typeof buildTab>;
/**
 * A scoped and simplified part of the headless state that is relevant to the `Tab` controller.
 */
export type TabState = Tab['state'];

export function buildTab(
  engine: Engine<ConfigurationSection & AdvancedSearchQueriesSection>,
  props: TabProps
) {
  const controller = buildController(engine);
  const {dispatch} = engine;

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
    /**
     * Activates the tab.
     */
    select() {
      dispatch(updateAdvancedSearchQueries({cq: options.expression}));
      dispatch(executeSearch(logInterfaceChange()));
    },
    /**
     * The state of the `Tab` controller.
     */
    get state() {
      const isActive =
        engine.state.advancedSearchQueries.cq === options.expression;
      return {
        /** `true` if tab is selected; `false` otherwise. */
        isActive,
      };
    },
  };
}
