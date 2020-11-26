import {Engine} from '../../app/headless-engine';
import {ConfigurationSection, SearchSection} from '../../state/state-sections';
import {buildController} from '../controller/headless-controller';

/**
 * The `Debug` controller is in charge of allowing displaying debug information.
 */
export type Debug = ReturnType<typeof buildDebug>;
/** The state relevant to the `Debug` controller.*/
export type DebugState = Debug['state'];

export const buildDebug = (
  engine: Engine<ConfigurationSection & SearchSection>
) => {
  const controller = buildController(engine);

  // TODO: allow to enable/disable from here

  return {
    ...controller,
    get state() {
      // TODO: Format state
      return engine.state.search.response;
    },
  };
};
