import {Engine} from '../../app/headless-engine';
import {buildController} from '../controller/headless-controller';
import {
  registerConstantQuery,
  updateConstantQuery,
} from '../../features/constant-query/constant-query-actions';
import {executeSearch} from '../../features/search/search-actions';
import {logInterfaceChange} from '../../features/analytics/analytics-actions';

type TabOptions = {
  expression: string;
};

export interface TabProps {
  options: TabOptions;
  initialState?: Partial<TabInitialState>;
}

export interface TabInitialState {
  isActive: boolean;
}

export type Tab = ReturnType<typeof buildTab>;
export type TabState = Tab['state'];

export function buildTab(engine: Engine, props: TabProps) {
  const controller = buildController(engine);
  const {dispatch} = engine;

  if (props.initialState?.isActive) {
    dispatch(registerConstantQuery(props.options.expression));
  }

  return {
    ...controller,
    /**
     * Makes this tab the active one
     */
    select() {
      dispatch(updateConstantQuery(props.options.expression));
      dispatch(executeSearch(logInterfaceChange()));
    },

    get state() {
      const isActive =
        engine.state.constantQuery.cq === props.options.expression;
      return {isActive};
    },
  };
}
