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
   * The Id of the record to attach to.
   */
  recordId: string;
}

/**
 * The AttachedResults controller manages all attached results for a given record.
 * It provides a unified API to attach/detach results, check attachment status,
 * and access all attached results for the record.
 *
 * @group Controllers
 * @category AttachedResults
 */
export interface AttachedResults extends Controller {
  /**
   * Check if a specific result is attached to this record.
   * @param result - The result to check if attached, with SearchAPI fields
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
   * Returns all attached results for this record.
   */
  state: AttachedResult[];
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
  const {recordId} = props.options;

  const isResultAttached = (result: Result): boolean => {
    if (isNullOrUndefined(recordId)) {
      return false;
    }

    if (
      isNullOrUndefined(result.raw.permanentid) &&
      isNullOrUndefined(result.raw.urihash)
    ) {
      return false;
    }
    return engine.state.attachedResults.results.some((attached) => {
      const recordIdMatches = recordId === attached.caseId; // Note: still using caseId in state
      const permanentIdMatches =
        !isNullOrUndefined(attached.permanentId) &&
        attached.permanentId === result.raw.permanentid;
      const uriHashMatches =
        !isNullOrUndefined(attached.uriHash) &&
        attached.uriHash === result.raw.urihash;
      return recordIdMatches && (permanentIdMatches || uriHashMatches);
    });
  };

  const getAttachedResultsForRecord = (): AttachedResult[] => {
    return engine.state.attachedResults.results.filter(
      (attached) => attached.caseId === recordId // Note: still using caseId in state
    );
  };

  return {
    ...controller,

    get state() {
      return getAttachedResultsForRecord();
    },

    isAttached(result: Result): boolean {
      return isResultAttached(result);
    },

    attach(result: Result): void {
      dispatch(
        attachResult(buildAttachedResultFromSearchResult(result, recordId))
      );
      dispatch(logCaseAttach(result));
    },

    detach(result: Result): void {
      dispatch(
        detachResult(buildAttachedResultFromSearchResult(result, recordId))
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
