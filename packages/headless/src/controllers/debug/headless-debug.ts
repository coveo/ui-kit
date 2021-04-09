import {Engine} from '../../app/headless-engine';
import {disableDebug, enableDebug} from '../../features/debug/debug-actions';
import {DebugSection} from '../../state/state-sections';
import {buildController, Controller} from '../controller/headless-controller';

/**
 * The `Debug` controller controls whether to retrieve debug information from the calls made to Coveo Relevance Cloud.
 */
export interface Debug extends Controller {
  /**
   * Enables the debug mode.
   */
  enable(): void;

  /**
   * Disables the debug mode.
   */
  disable(): void;

  /**
   * The state of the `Debug` controller.
   */
  state: DebugState;
}

export type DebugState = boolean;

/**
 * Creates a `Debug` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `Debug` controller instance.
 */
export function buildDebug(engine: Engine<DebugSection>): Debug {
  const controller = buildController(engine);
  const {dispatch} = engine;

  return {
    ...controller,

    get state() {
      return engine.state.debug;
    },

    enable() {
      dispatch(enableDebug());
    },

    disable() {
      dispatch(disableDebug());
    },
  };
}
