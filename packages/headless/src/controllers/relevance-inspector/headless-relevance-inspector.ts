import {BooleanValue, Schema} from '@coveo/bueno';
import {FieldDescription} from '../../api/search/fields/fields-response';
import {
  ExecutionReport,
  ExecutionStep,
} from '../../api/search/search/execution-report';
import {QueryRankingExpression} from '../../api/search/search/query-ranking-expression';
import {Result} from '../../api/search/search/result';
import {SearchResponseSuccessWithDebugInfo} from '../../api/search/search/search-response';
import {SecurityIdentity} from '../../api/search/search/security-identity';
import {configuration, debug, search, fields} from '../../app/reducers';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {enableDebug, disableDebug} from '../../features/debug/debug-actions';
import {rankingInformationSelector} from '../../features/debug/debug-selectors';
import {
  QueryRankingExpressionWeights,
  DocumentWeights,
  RankingInformation,
  TermWeightReport,
} from '../../features/debug/ranking-info-parser';
import {
  debugFields,
  fetchFieldsDescription,
} from '../../features/fields/fields-actions';
import {
  ConfigurationSection,
  DebugSection,
  FieldsSection,
  SearchSection,
} from '../../state/state-sections';
import {loadReducerError} from '../../utils/errors';
import {validateInitialState} from '../../utils/validate-payload';
import {buildController, Controller} from '../controller/headless-controller';

export {
  RankingInformation,
  DocumentWeights,
  TermWeightReport,
  QueryRankingExpressionWeights,
  ExecutionReport,
  ExecutionStep,
  SecurityIdentity,
  QueryRankingExpression,
};

export interface RelevanceInspectorProps {
  /**
   * The initial state that should be applied to the `RelevanceInspector` controller.
   */
  initialState?: RelevanceInspectorInitialState;
}

const initialStateSchema = new Schema({
  enabled: new BooleanValue({default: false}),
});

export interface RelevanceInspectorInitialState {
  /**
   * Whether debug mode should be enabled.
   * */
  enabled?: boolean;
}

/**
 * The `RelevanceInspector` controller is in charge of allowing displaying various debug information.
 */
export interface RelevanceInspector extends Controller {
  /**
   * Fetch the description of all fields available from the index.
   */
  fetchFieldsDescription(): void;
  /**
   * Fetch all fields available from the index on each of the individual results.
   */
  debugFields(fetchAll: boolean): void;
  /**
   * Enables debug mode.
   */
  enable(): void;

  /**
   * Disables debug mode.
   */
  disable(): void;

  /**
   * The state of the `RelevanceInspector` controller.
   * */
  state: RelevanceInspectorState;
}

export interface RelevanceInspectorState {
  /**
   * Whether debug mode is enabled.
   * */
  isEnabled: boolean;

  /**
   * The ranking information for every result.
   */
  rankingInformation?: ResultRankingInformation[];

  /**
   * The query execution report.
   */
  executionReport?: ExecutionReport;

  /**
   * The query expressions sent in the request.
   */
  expressions?: QueryExpressions;

  /**
   * The security identities.
   */
  userIdentities?: SecurityIdentity[];

  /**
   * The ranking expressions.
   */
  rankingExpressions?: QueryRankingExpression[];

  /**
   * The description of all fields available in the index.
   */
  fieldsDescription?: FieldDescription[];
  /**
   * Whether fields debugging is enabled, returning all fields available on query results.
   */
  debugFields?: boolean;
}

export interface ResultRankingInformation {
  /**
   * The result.
   */
  result: Result;

  /**
   * The ranking information for the associated result.
   */
  ranking: RankingInformation | null;
}

export interface QueryExpressions {
  /**
   * The search query.
   */
  basicExpression: string;

  /**
   * The dynamic filter expression, sent as the `aq` parameter in the request.
   */
  advancedExpression: string;

  /**
   * The static filter expression, typically set by a `Tab`.
   */
  constantExpression: string;
}

/**
 * Creates a `RelevanceInspector` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `RelevanceInspector` properties.
 * @returns A `RelevanceInspector` controller instance.
 */
export function buildRelevanceInspector(
  engine: SearchEngine,
  props: RelevanceInspectorProps = {}
): RelevanceInspector {
  if (!loadRelevanceInspectorReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;
  const getState = () => engine.state;

  const initialState = validateInitialState(
    engine,
    initialStateSchema,
    props.initialState,
    'buildRelevanceInspector'
  );

  if (initialState.enabled) {
    dispatch(enableDebug());
  }

  return {
    ...controller,

    get state() {
      const state = getState();
      const isEnabled = state.debug;

      if (!state.debug) {
        return {isEnabled};
      }

      const {
        executionReport,
        basicExpression,
        advancedExpression,
        constantExpression,
        userIdentities,
        rankingExpressions,
      } = state.search.response as SearchResponseSuccessWithDebugInfo;

      const {fieldsDescription, debugFields} = state.fields;

      return {
        isEnabled,
        rankingInformation: rankingInformationSelector(state),
        executionReport,
        expressions: {
          basicExpression,
          advancedExpression,
          constantExpression,
        },
        userIdentities,
        rankingExpressions,
        fieldsDescription,
        debugFields,
      };
    },

    enable() {
      dispatch(enableDebug());
    },

    disable() {
      dispatch(disableDebug());
    },

    debugFields(fetchAll: boolean) {
      dispatch(debugFields(fetchAll));
    },

    fetchFieldsDescription() {
      dispatch(fetchFieldsDescription());
    },
  };
}

function loadRelevanceInspectorReducers(
  engine: SearchEngine
): engine is SearchEngine<
  DebugSection & SearchSection & ConfigurationSection & FieldsSection
> {
  engine.addReducers({
    debug,
    search,
    configuration,
    fields,
  });
  return true;
}
