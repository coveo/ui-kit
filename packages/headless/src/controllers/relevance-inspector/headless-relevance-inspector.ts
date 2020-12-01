import {BooleanValue, Schema, SchemaValues} from '@coveo/bueno';
import {Engine} from '../../app/headless-engine';
import {updateSearchConfiguration} from '../../features/configuration/configuration-actions';
import {rankingInformationSelector} from '../../features/debug/debug-selectors';
import {ConfigurationSection, SearchSection} from '../../state/state-sections';
import {validateOptions} from '../../utils/validate-payload';
import {buildController} from '../controller/headless-controller';

/**
 * The `RelevanceInspector` controller is in charge of allowing displaying various debug information.
 */
export type RelevanceInspector = ReturnType<typeof buildRelevanceInspector>;
/** The state relevant to the `RelevanceInspector` controller.*/
export type RelevanceInspectorState = RelevanceInspector['state'];

const optionsSchema = new Schema({
  /** If debug mode should be enabled when initialized. */
  enabled: new BooleanValue({default: false}),
});

export interface RelevanceInspectorProps {
  options?: RelevanceInspectorOptions;
}

export type RelevanceInspectorOptions = SchemaValues<typeof optionsSchema>;

/**
 * The `RelevanceInspector` controller is in charge of allowing displaying various debug information.
 */
export const buildRelevanceInspector = (
  engine: Engine<ConfigurationSection & SearchSection>,
  props: RelevanceInspectorProps = {}
) => {
  const controller = buildController(engine);
  const options = validateOptions(
    optionsSchema,
    props.options,
    buildRelevanceInspector.name
  );

  const toggleDebug = (enableDebug: boolean) =>
    engine.dispatch(updateSearchConfiguration({enableDebug}));

  if (options.enabled) {
    toggleDebug(true);
  }

  return {
    ...controller,

    /** @returns The state of the `RelevanceInspector` controller. */
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
