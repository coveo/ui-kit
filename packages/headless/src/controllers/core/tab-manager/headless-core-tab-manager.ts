import {createSelector} from '@reduxjs/toolkit';
import {CoreEngine} from '../../../app/engine';
import {tabSetReducer as tabSet} from '../../../features/tab-set/tab-set-slice';
import {TabSection} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';

export interface TabManager extends Controller {
  /**
   * The state of the `TabManager` controller.
   */
  state: TabManagerState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `TabManager` controller.
 */
export interface TabManagerState {
  activeTab: string;
}

/**
 * @internal
 */
export function buildCoreTabManager(engine: CoreEngine): TabManager {
  if (!loadTabReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);

  const currentTab = createSelector(
    (state: typeof engine.state) => state.tabSet,
    (state) => {
      const activeTab = Object.values(state).find((tab) => tab.isActive);
      return activeTab?.id ?? '';
    }
  );

  return {
    ...controller,

    get state() {
      return {activeTab: currentTab(engine.state)};
    },
  };
}

function loadTabReducers(engine: CoreEngine): engine is CoreEngine<TabSection> {
  engine.addReducers({tabSet});
  return true;
}
