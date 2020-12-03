import {BooleanValue, Schema, SchemaValues} from '@coveo/bueno';
import {SearchResponseSuccessWithDebugInfo} from '../../api/search/search/search-response';
import {Engine} from '../../app/headless-engine';
import {enableDebug, disableDebug} from '../../features/debug/debug-actions';
import {rankingInformationSelector} from '../../features/debug/debug-selectors';
import {DebugSection, SearchSection} from '../../state/state-sections';
import {
  validateInitialState,
  validateOptions,
} from '../../utils/validate-payload';
import {buildController} from '../controller/headless-controller';

export interface RelevanceInspectorProps {
  initialState?: RelevanceInspectorInitialState;
  options?: RelevanceInspectorOptions;
}

const initialStateSchema = new Schema({
  /**  If debug mode should be enabled */
  enabled: new BooleanValue({default: false}),
});

const optionsSchema = new Schema({
  /** Whether to automatically log state to console on new responses */
  automaticallyLogInformation: new BooleanValue({default: true}),
});

export type RelevanceInspectorInitialState = SchemaValues<
  typeof initialStateSchema
>;

export type RelevanceInspectorOptions = SchemaValues<typeof optionsSchema>;

export type RelevanceInspectorState = RelevanceInspector['state'];

/**
 * The `RelevanceInspector` controller is in charge of allowing displaying various debug information.
 */
export type RelevanceInspector = ReturnType<typeof buildRelevanceInspector>;

export function buildRelevanceInspector(
  engine: Engine<DebugSection & SearchSection>,
  props: RelevanceInspectorProps = {}
) {
  let prevSearchUid = '';
  const controller = buildController(engine);
  const {dispatch} = engine;
  const initialState = validateInitialState(
    initialStateSchema,
    props.initialState,
    buildRelevanceInspector.name
  );
  const options = validateOptions(
    optionsSchema,
    props.options,
    buildRelevanceInspector.name
  );

  const hasNewResponse = (currentSearchUid: string): boolean => {
    const hasChanged = currentSearchUid !== prevSearchUid;
    prevSearchUid = currentSearchUid;
    return hasChanged;
  };

  if (initialState.enabled) {
    dispatch(enableDebug());
  }

  return {
    ...controller,

    /** @returns The state of the `RelevanceInspector` controller. */
    get state() {
      const isEnabled = engine.state.debug;
      if (!engine.state.debug) {
        return {isEnabled};
      }

      const {
        executionReport,
        basicExpression,
        advancedExpression,
        constantExpression,
        userIdentities,
        rankingExpressions,
      } = engine.state.search.response as SearchResponseSuccessWithDebugInfo;

      return {
        isEnabled,
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

    /**
     * Logs information to the console.
     */
    logInformation() {
      if (!this.state.isEnabled) {
        engine.logger.warn(
          'The relevance inspector has to be enabled in order to log information.'
        );
        return;
      }

      engine.logger.info(
        this.state,
        'Relevance inspector information for new query'
      );
    },

    subscribe(listener: () => void) {
      listener();
      return engine.subscribe(() => {
        if (hasNewResponse(engine.state.search.response.searchUid)) {
          if (this.state.isEnabled && options.automaticallyLogInformation) {
            this.logInformation();
          }
          listener();
        }
      });
    },
  };
}
