import {configuration} from '../../../app/common-reducers';
import {CoreEngine} from '../../../app/engine';
import {tabSetReducer as tabSet} from '../../../features/tab-set/tab-set-slice';
import {ConfigurationSection, TabSection} from '../../../state/state-sections';
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
 * Creates a `TabManager` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `TabManager` controller instance.
 */
export function buildCoreTabManager(engine: CoreEngine): TabManager {
  if (!loadTabReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);

  const getCurrentTab = () => {
    return (
      Object.values(engine.state.tabSet ?? {}).find((tab) => tab.isActive)
        ?.id ?? ''
    );
  };

  return {
    ...controller,

    get state() {
      const activeTab = getCurrentTab();
      return {activeTab};
    },
  };
}

function loadTabReducers(
  engine: CoreEngine
): engine is CoreEngine<ConfigurationSection & TabSection> {
  engine.addReducers({configuration, tabSet});
  return true;
}
