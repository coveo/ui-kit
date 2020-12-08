import {Engine} from '../../app/headless-engine';
import {buildController} from '../controller/headless-controller';
import {executeSearch} from '../../features/search/search-actions';
import {logInterfaceChange} from '../../features/analytics/analytics-actions';
import {updateAdvancedSearchQueries} from '../../features/advanced-search-queries/advanced-search-queries-actions';
import {
  AdvancedSearchQueriesSection,
  ConfigurationSection,
} from '../../state/state-sections';
import {BooleanValue, Schema, SchemaValues, StringValue} from '@coveo/bueno';
import {
  validateInitialState,
  validateOptions,
} from '../../utils/validate-payload';

export type TabOptions = {
  expression: string;
};

const optionsSchema = new Schema({
  expression: new StringValue(),
});

const initialStateSchema = new Schema({
  isActive: new BooleanValue(),
});

export interface TabProps {
  options: TabOptions;
  initialState?: TabInitialState;
}

export type TabInitialState = SchemaValues<typeof initialStateSchema>;

export type Tab = ReturnType<typeof buildTab>;
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
     * Makes this tab the active one
     */
    select() {
      dispatch(updateAdvancedSearchQueries({cq: options.expression}));
      dispatch(executeSearch(logInterfaceChange()));
    },

    get state() {
      const isActive =
        engine.state.advancedSearchQueries.cq === options.expression;
      return {isActive};
    },
  };
}
