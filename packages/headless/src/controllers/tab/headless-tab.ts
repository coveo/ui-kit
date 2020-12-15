import {Engine} from '../../app/headless-engine';
import {buildController} from '../controller/headless-controller';
import {executeSearch} from '../../features/search/search-actions';
import {logInterfaceChange} from '../../features/analytics/analytics-actions';
import {updateAdvancedSearchQueries} from '../../features/advanced-search-queries/advanced-search-queries-actions';
import {
  AdvancedSearchQueriesSection,
  ConfigurationSection,
} from '../../state/state-sections';
import {BooleanValue, Schema, StringValue} from '@coveo/bueno';
import {
  validateInitialState,
  validateOptions,
} from '../../utils/validate-payload';

type TabOptions = {
  /**
   * A constant query expression or filter that the Tab should add to any outgoing query.
   *
   * **Example:**
   *
   * `@objecttype==Message`
   */
  expression: string;
};

type TabInitialState = {
  /**
   * Specifies if the tab is currently active, or selected.
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

export type Tab = ReturnType<typeof buildTab>;
/**
 * A scoped and simplified part of the headless state that is relevant to the `Tab` controller.
 */
export type TabState = Tab['state'];

/**
 * The `Tab` headless controller offers a high-level interface that allows the end user to select a specific search interface.
 * It is in charge of adding a constant expression to the outgoing query in order to refine the results.
 */
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
    buildTab.name
  );
  const initialState = validateInitialState(
    engine,
    initialStateSchema,
    props.initialState,
    buildTab.name
  );

  if (initialState.isActive) {
    dispatch(updateAdvancedSearchQueries({cq: options.expression}));
  }

  return {
    ...controller,
    /**
     * Select and make this tab the currently active one.
     */
    select() {
      dispatch(updateAdvancedSearchQueries({cq: options.expression}));
      dispatch(executeSearch(logInterfaceChange()));
    },

    /**
     * @returns (TabState) The state of the `Tab` controller.
     */
    get state() {
      const isActive =
        engine.state.advancedSearchQueries.cq === options.expression;
      return {isActive};
    },
  };
}
