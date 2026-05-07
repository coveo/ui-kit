/**
 * Engine Options Type
 *
 * Configuration options passed to the Engine constructor.
 *
 * CRITICAL: NO imports from @reduxjs/toolkit or immer allowed.
 */

import type {ConfigurationState} from '@/src/core/interface/configuration/configuration-types.js';
import type {NavigatorContextProvider} from '@/src/core/interface/navigator-context/navigator-context-types.js';

/**
 * Options passed to the Engine constructor.
 * All fields are optional; defaults are applied at initialization.
 */
export interface EngineOptions {
  /** Optional initial configuration state. */
  configuration?: ConfigurationState;
  /** Optional navigator context provider function. */
  navigatorContextProvider?: NavigatorContextProvider;
}
