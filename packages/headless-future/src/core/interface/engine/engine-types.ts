import type {ConfigurationState} from '@/src/core/interface/configuration/configuration-types.js';
import type {NavigatorContextProvider} from '@/src/core/interface/navigator-context/navigator-context-types.js';

export interface EngineOptions {
  /**
   * The initial configuration state.
   */
  configuration?: ConfigurationState;

  /**
   * The navigator context provider function.
   */
  navigatorContextProvider?: NavigatorContextProvider;
}
