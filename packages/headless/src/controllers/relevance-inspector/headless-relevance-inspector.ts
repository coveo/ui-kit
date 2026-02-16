import {BooleanValue, Schema} from '@coveo/bueno';
import type {FieldDescription} from '../../api/search/fields/fields-response.js';
import type {
  ExecutionReport,
  ExecutionStep,
} from '../../api/search/search/execution-report.js';
import type {QueryRankingExpression} from '../../api/search/search/query-ranking-expression.js';
import type {Result} from '../../api/search/search/result.js';
import type {SearchResponseSuccessWithDebugInfo} from '../../api/search/search/search-response.js';
import type {SecurityIdentity} from '../../api/search/search/security-identity.js';
import {configuration} from '../../app/common-reducers.js';
import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import {disableDebug, enableDebug} from '../../features/debug/debug-actions.js';
import {rankingInformationSelector} from '../../features/debug/debug-selectors.js';
import {debugReducer as debug} from '../../features/debug/debug-slice.js';
import type {
  DocumentWeights,
  QueryRankingExpressionWeights,
  RankingInformation,
  TermWeightReport,
} from '../../features/debug/ranking-info-parser.js';
import {
  disableFetchAllFields,
  enableFetchAllFields,
  fetchFieldsDescription,
} from '../../features/fields/fields-actions.js';
import {fieldsReducer as fields} from '../../features/fields/fields-slice.js';
import {searchReducer as search} from '../../features/search/search-slice.js';
import type {
  ConfigurationSection,
  DebugSection,
  FieldsSection,
  SearchSection,
} from '../../state/state-sections.js';
import {loadReducerError} from '../../utils/errors.js';
import {validateInitialState} from '../../utils/validate-payload.js';
import {
  buildController,
  type Controller,
} from '../controller/headless-controller.js';

export type {
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
 *
 * Example: [relevance-inspector.fn.tsx](https://github.com/coveo/ui-kit/blob/main/samples/headless/search-react/src/components/relevance-inspector/relevance-inspector.fn.tsx)
 *
 * @group Controllers
 * @category RelevanceInspector
 */
export interface RelevanceInspector extends Controller {
  /**
   * Fetch the description of all fields available from the index.
   */
  fetchFieldsDescription(): void;
  /**
   * Fetch all fields available from the index on each individual results.
   */
  enableFetchAllFields(): void;
  /**
   * Disable fetching all available fields from the index.
   */
  disableFetchAllFields(): void;
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

/**
 * A scoped and simplified part of the headless state that is relevant to the `RelevanceInspector` controller.
 *
 * @group Controllers
 * @category RelevanceInspector
 */
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
  fetchAllFields?: boolean;
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
 *
 * @group Controllers
 * @category RelevanceInspector
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

  const warnProductionEnvironment = (flag: string) => {
    engine.logger.warn(
      `Flag [ ${flag} ] is now activated. This should *not* be used in any production environment as it negatively impact performance.`
    );
  };

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

      const {fieldsDescription, fetchAllFields} = state.fields;

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
        fetchAllFields,
      };
    },

    enable() {
      dispatch(enableDebug());
      warnProductionEnvironment('debug');
    },

    disable() {
      dispatch(disableDebug());
      dispatch(disableFetchAllFields());
    },

    enableFetchAllFields() {
      dispatch(enableFetchAllFields());
      warnProductionEnvironment('fetchAllFields');
    },

    disableFetchAllFields() {
      dispatch(disableFetchAllFields());
    },

    fetchFieldsDescription() {
      !this.state.isEnabled && dispatch(enableDebug());
      dispatch(fetchFieldsDescription());
      warnProductionEnvironment('fieldsDescription');
      engine.logger.warn(
        `For production environment, please specify the necessary fields either when instantiating a ResultList controller, or by dispatching a registerFieldsToInclude action.
        
        https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.ResultListOptions.html
        https://docs.coveo.com/en/headless/latest/reference/interfaces/Search.FieldActionCreators.html#registerfieldstoinclude`
      );
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
