import {BooleanValue, Schema, SchemaValues} from '@coveo/bueno';
import {Engine} from '../../app/headless-engine';
import {updateSearchConfiguration} from '../../features/configuration/configuration-actions';
import {rankingInformationSelector} from '../../features/debug/debug-selectors';
import {ConfigurationSection, SearchSection} from '../../state/state-sections';
import {validateOptions} from '../../utils/validate-payload';
import {buildController} from '../controller/headless-controller';

/**
 * The `Debug` controller is in charge of allowing displaying debug information.
 */
export type Debug = ReturnType<typeof buildDebug>;
/** The state relevant to the `Debug` controller.*/
export type DebugState = Debug['state'];

const optionsSchema = new Schema({
  /** If debug mode should be enabled when initialized. */
  enabled: new BooleanValue({default: false}),
});

export interface DebugProps {
  options?: DebugOptions;
}

export type DebugOptions = SchemaValues<typeof optionsSchema>;

/**
 * The `Debug` controller allows to retrieve debug information.
 */
export const buildDebug = (
  engine: Engine<ConfigurationSection & SearchSection>,
  props: DebugProps = {}
) => {
  const controller = buildController(engine);
  const options = validateOptions(
    optionsSchema,
    props.options,
    buildDebug.name
  );

  const toggleDebug = (enableDebug: boolean) =>
    engine.dispatch(updateSearchConfiguration({enableDebug}));

  if (options.enabled) {
    toggleDebug(true);
  }

  return {
    ...controller,

    /** @returns The state of the `Debug` controller. */
    get state() {
      const {
        executionReport,
        basicExpression,
        advancedExpression,
        constantExpression,
        userIdentities,
        rankingExpressions,
      } = engine.state.search.response;

      return {
        isEnabled: engine.state.configuration.search.enableDebug,
        rankingInformation: rankingInformationSelector(engine.state),
        executionReport,
        expressions: {
          basicExpression,
          advancedExpression,
          constantExpression,
        },
        userIdentities,
        rankingExpressions,
        // fields: [], TODO: allow to fetch fields from the API
      };
    },

    /**
     * Enables debug.
     */
    enable() {
      toggleDebug(true);
    },

    /**
     * Disables debug.
     */
    disable() {
      toggleDebug(false);
    },
  };
};
