import {isNullOrUndefined} from '@coveo/bueno';
import type {Result} from '../../../api/search/search/result.js';
import {configuration} from '../../../app/common-reducers.js';
import type {InsightEngine} from '../../../app/insight-engine/insight-engine.js';
import {
  attachResult,
  detachResult,
} from '../../../features/attached-results/attached-results-actions.js';
import {
  logCaseAttach,
  logCaseDetach,
} from '../../../features/attached-results/attached-results-analytics-actions.js';
import {attachedResultsReducer as attachedResults} from '../../../features/attached-results/attached-results-slice.js';
import type {AttachedResult} from '../../../features/attached-results/attached-results-state.js';
import {buildAttachedResultFromSearchResult} from '../../../features/attached-results/attached-results-utils.js';
import type {
  AttachedResultsSection,
  ConfigurationSection,
} from '../../../state/state-sections.js';
import {loadReducerError} from '../../../utils/errors.js';
import {
  buildController,
  type Controller,
} from '../../controller/headless-controller.js';

export interface AttachedResultsProps {
  /**
   * The options for the `AttachedResults` controller.
   */
  options: AttachedResultsOptions;
}

export interface AttachedResultsOptions {
  /**
   * The Id of the case to attach to.
   */
  caseId: string;
}

export interface AttachedResultsState {
  /**
   * The list of attached results for the specified case.
   */
  results: AttachedResult[];
  /**
   * Whether the attached results are currently being loaded.
   */
  loading: boolean;
}

/**
 * The AttachedResults controller manages all attached results for a given case.
 * It provides a unified API to attach/detach results, check attachment status,
 * and access all attached results for the case.
 *
 * @group Controllers
 * @category AttachedResults
 */
export interface AttachedResults extends Controller {
  /**
   * Check if a specific result is attached to this case.
   * @param result - The result to check if attached, with SearchAPI fields such as permanentId or uriHash.
   * @returns A boolean indicating if the result is attached.
   */
  isAttached(result: Result): boolean;
  /**
   * Attach a new result by adding it to the attachedResults state.
   * @param result - A result to add to the list of currently attached results.
   */
  attach(result: Result): void;
  /**
   * Detach a result by removing it from the attachedResults state.
   * @param result - A result to remove from the list of currently attached results.
   */
  detach(result: Result): void;
  /**
   * The state of the `AttachedResults` controller.
   * Returns all attached results for this case.
   */
  state: AttachedResultsState;
}

/**
 * Creates an AttachedResults controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `AttachedResults` properties.
 * @returns A `AttachedResults` controller instance.
 *
 * @group Controllers
 * @category AttachedResults
 */
export function buildAttachedResults(
  engine: InsightEngine,
  props: AttachedResultsProps
): AttachedResults {
  if (!loadAttachedResultsReducers(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;
  const controller = buildController(engine);
  const {caseId} = props.options;

  const isResultAttached = (result: Result): boolean => {
    if (isNullOrUndefined(caseId)) {
      return false;
    }

    if (
      isNullOrUndefined(result.raw.permanentid) &&
      isNullOrUndefined(result.raw.urihash)
    ) {
      return false;
    }
    return engine.state.attachedResults.results.some((attached) => {
      const caseIdMatches = caseId === attached.caseId;
      const permanentIdMatches =
        !isNullOrUndefined(attached.permanentId) &&
        attached.permanentId === result.raw.permanentid;
      const uriHashMatches =
        !isNullOrUndefined(attached.uriHash) &&
        attached.uriHash === result.raw.urihash;
      return caseIdMatches && (permanentIdMatches || uriHashMatches);
    });
  };

  const getAttachedResultsForRecord = (): AttachedResult[] => {
    return engine.state.attachedResults.results.filter(
      (attached) => attached.caseId === caseId
    );
  };

  return {
    ...controller,

    get state() {
      return {
        results: getAttachedResultsForRecord(),
        loading: engine.state.attachedResults.loading,
      };
    },

    isAttached(result: Result): boolean {
      return isResultAttached(result);
    },

    attach(result: Result): void {
      dispatch(
        attachResult(buildAttachedResultFromSearchResult(result, caseId))
      );
      dispatch(logCaseAttach(result));
    },

    detach(result: Result): void {
      dispatch(
        detachResult(buildAttachedResultFromSearchResult(result, caseId))
      );
      dispatch(logCaseDetach(result));
    },
  };
}

function loadAttachedResultsReducers(
  engine: InsightEngine
): engine is InsightEngine<ConfigurationSection & AttachedResultsSection> {
  engine.addReducers({configuration, attachedResults});
  return true;
}
