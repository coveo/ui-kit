import {BooleanValue, Schema} from '@coveo/bueno';
import {ExecutionReport} from '../../api/search/search/execution-report';
import {RankingExpression} from '../../api/search/search/ranking-expression';
import {Result} from '../../api/search/search/result';
import {SearchResponseSuccessWithDebugInfo} from '../../api/search/search/search-response';
import {UserIdentity} from '../../api/search/search/user-identity';
import {Engine} from '../../app/headless-engine';
import {
  AnalyticsType,
  makeNoopAnalyticsAction,
} from '../../features/analytics/analytics-utils';
import {enableDebug, disableDebug} from '../../features/debug/debug-actions';
import {rankingInformationSelector} from '../../features/debug/debug-selectors';
import {
  ListOfQRE,
  ListOfWeights,
  WeightsPerTerm,
} from '../../features/debug/ranking-info-parser';
import {executeSearch} from '../../features/search/search-actions';
import {
  ConfigurationSection,
  DebugSection,
  SearchSection,
} from '../../state/state-sections';
import {
  validateInitialState,
  validateOptions,
} from '../../utils/validate-payload';
import {buildController, Controller} from '../controller/headless-controller';

export interface RelevanceInspectorProps {
  initialState?: RelevanceInspectorInitialState;
  options?: RelevanceInspectorOptions;
}

const initialStateSchema = new Schema({
  enabled: new BooleanValue({default: false}),
});

const optionsSchema = new Schema({
  automaticallyLogInformation: new BooleanValue({default: true}),
});

export interface RelevanceInspectorInitialState {
  /**
   * Whether debug mode should be enabled.
   * */
  enabled?: boolean;
}

export interface RelevanceInspectorOptions {
  /**
   * Whether to automatically log state to console on new responses.
   * */
  automaticallyLogInformation?: boolean;
}

/**
 * The `RelevanceInspector` controller is in charge of allowing displaying various debug information.
 */
export interface RelevanceInspector extends Controller {
  /**
   * Enables debug mode.
   */
  enable(): void;

  /**
   * Disables debug mode.
   */
  disable(): void;

  /**
   * Logs debug information to the console.
   */
  logInformation(): void;

  /**
   * The state of the `RelevanceInspector` controller.
   * */
  state: RelevanceInspectorState;
}

export interface RelevanceInspectorState {
  isEnabled: boolean;
  rankingInformation?: RankingInformation[];
  executionReport?: ExecutionReport;
  expressions?: Expressions;
  userIdentities?: UserIdentity[];
  rankingExpressions?: RankingExpression[];
}

export interface RankingInformation {
  result: Result;
  ranking: Ranking | null;
}

export interface Ranking {
  documentWeights: ListOfWeights | null;
  termsWeight: Record<string, WeightsPerTerm> | null;
  totalWeight: number | null;
  qreWeights: ListOfQRE[];
}

export interface Expressions {
  basicExpression: string;
  advancedExpression: string;
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
  engine: Engine<DebugSection & SearchSection & ConfigurationSection>,
  props: RelevanceInspectorProps = {}
): RelevanceInspector {
  let prevSearchUid = '';
  const controller = buildController(engine);
  const {dispatch} = engine;
  const initialState = validateInitialState(
    engine,
    initialStateSchema,
    props.initialState,
    'buildRelevanceInspector'
  );
  const options = validateOptions(
    engine,
    optionsSchema,
    props.options,
    'buildRelevanceInspector'
  );

  const hasNewResponse = (currentSearchUid: string): boolean => {
    const hasChanged = currentSearchUid !== prevSearchUid;
    prevSearchUid = currentSearchUid;
    return hasChanged;
  };

  let logOnNextResponse = false;

  if (initialState.enabled) {
    dispatch(enableDebug());
  }

  return {
    ...controller,

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

    enable() {
      dispatch(enableDebug());
    },

    disable() {
      dispatch(disableDebug());
    },

    logInformation() {
      if (this.state.isEnabled) {
        engine.logger.info(
          this.state,
          'Relevance inspector information for new query'
        );
        return;
      }

      engine.logger.warn(
        'Relevance inspector "logInformation" has been called without debug being enabled. Enabling debug and triggering a query'
      );
      logOnNextResponse = true;
      this.enable();
      dispatch(executeSearch(makeNoopAnalyticsAction(AnalyticsType.Search)()));
    },

    subscribe(listener: () => void) {
      const unsubscribeLogListener = engine.subscribe(() => {
        if (
          hasNewResponse(engine.state.search.response.searchUid) &&
          this.state.isEnabled &&
          (options.automaticallyLogInformation || logOnNextResponse)
        ) {
          logOnNextResponse = false;
          this.logInformation();
        }
      });

      const getState = () => this.state;

      const unsubscribeStateListener = {
        ...controller,
        get state() {
          return getState();
        },
      }.subscribe(listener);

      return () => {
        unsubscribeLogListener();
        unsubscribeStateListener();
      };
    },
  };
}
