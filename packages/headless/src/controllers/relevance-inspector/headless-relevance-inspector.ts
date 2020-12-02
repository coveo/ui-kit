import {BooleanValue, Schema, SchemaValues} from '@coveo/bueno';
import {SearchResponseSuccessWithDebugInfo} from '../../api/search/search/search-response';
import {Engine} from '../../app/headless-engine';
import {enableDebug, disableDebug} from '../../features/debug/debug-actions';
import {rankingInformationSelector} from '../../features/debug/debug-selectors';
import {DebugSection, SearchSection} from '../../state/state-sections';
import {validateOptions} from '../../utils/validate-payload';
import {buildController} from '../controller/headless-controller';

export interface RelevanceInspectorProps {
  initialState?: RelevanceInspectorInitialState;
}

const initialStateSchema = new Schema({
  /**  If debug mode should be enabled */
  enabled: new BooleanValue({default: false}),
});

export type RelevanceInspectorInitialState = SchemaValues<
  typeof initialStateSchema
>;

export type RelevanceInspectorState = RelevanceInspector['state'];

/**
 * The `RelevanceInspector` controller is in charge of allowing displaying various debug information.
 */
export type RelevanceInspector = ReturnType<typeof buildRelevanceInspector>;

export function buildRelevanceInspector(
  engine: Engine<DebugSection & SearchSection>,
  props: RelevanceInspectorProps = {}
) {
  const controller = buildController(engine);
  const {dispatch} = engine;
  const initialState = validateOptions(
    initialStateSchema,
    props.initialState,
    buildRelevanceInspector.name
  );

  if (initialState.enabled) {
    dispatch(enableDebug());
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
      } = engine.state.search.response as SearchResponseSuccessWithDebugInfo;

      return {
        isEnabled: engine.state.debug,
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
      dispatch(enableDebug());
    },

    /**
     * Disables debug.
     */
    disable() {
      dispatch(disableDebug());
    },
  };
}
