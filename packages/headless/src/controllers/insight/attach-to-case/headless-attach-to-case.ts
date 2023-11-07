import {isNullOrUndefined} from '@coveo/bueno';
import {configuration} from '../../../app/common-reducers';
import {InsightEngine} from '../../../app/insight-engine/insight-engine';
import {
  attachResult,
  detachResult,
} from '../../../features/attached-results/attached-results-actions';
import {
  logCaseAttach,
  logCaseDetach,
} from '../../../features/attached-results/attached-results-analytics-actions';
import {attachedResultsReducer as attachedResults} from '../../../features/attached-results/attached-results-slice';
import {buildAttachedResultFromSearchResult} from '../../../features/attached-results/attached-results-utils';
import {Result} from '../../../insight.index';
import {
  AttachedResultsSection,
  ConfigurationSection,
} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';

export interface AttachToCaseProps {
  /**
   * The options for the `AttachToCase` controller.
   */
  options: AttachToCaseOptions;
}

export interface AttachToCaseOptions {
  /**
   * The result to attach, detach.
   */
  result: Result;
  /**
   * The Id of the case to attach to.
   */
  caseId: string;
}

/**
 * The AttachToCase controller is responsible for handling the attach and detach actions on a specific result.
 * It also provides a function `isAttached` to verify if currently a specific result is part of the attachedResults state.
 */
export interface AttachToCase extends Controller {
  /**
   * Check if a specific result is part of the list of AttachedResults in the state.
   * @param result A result to check if attached, with SearchAPI fields
   * @returns A boolean indicating if the result is attached.
   */
  isAttached(): boolean;
  /**
   * Attach a new result by adding it to the attachedResults state.
   * @param result A result to add to the list of currently attached results.
   */
  attach(): void;
  /**
   * Detach a result by removing it from the attachedResults state.
   * @param result A result to remove from the list of currently attached results.
   */
  detach(): void;
}

/**
 *
 * @param engine - The headless engine.
 * @param props - The configurable `AttachToCase` properties.
 * @returns - A `AttachToCase` controller instance.
 */
export function buildAttachToCase(
  engine: InsightEngine,
  props: AttachToCaseProps
): AttachToCase {
  if (!loadAttachedResultsReducers(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;
  const getState = () => engine.state.attachedResults;
  const controller = buildController(engine);
  const {result, caseId} = props.options;

  const isResultAttached = () => {
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

  return {
    ...controller,

    get state() {
      return getState();
    },

    isAttached() {
      return isResultAttached();
    },

    attach() {
      dispatch(
        attachResult({
          result: buildAttachedResultFromSearchResult(result, caseId),
        })
      );
      dispatch(logCaseAttach(result));
    },

    detach() {
      dispatch(
        detachResult({
          result: buildAttachedResultFromSearchResult(result, caseId),
        })
      );
      dispatch(logCaseDetach(result.raw.urihash));
    },
  };
}

function loadAttachedResultsReducers(
  engine: InsightEngine
): engine is InsightEngine<ConfigurationSection & AttachedResultsSection> {
  engine.addReducers({configuration, attachedResults});
  return true;
}
