import {InsightEngine} from '../../../app/insight-engine/insight-engine';
import {configuration, attachedResults} from '../../../app/reducers';
import {
  attachResult,
  detachResult,
} from '../../../features/attached-results/attached-results-actions';
import {AttachedResult} from '../../../features/attached-results/attached-results-state';
import {
  AttachedResultsSection,
  ConfigurationSection,
} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';

export interface SearchResultRaw {
  /**
   * The permanentid of the result, a unique identifier of a result.
   */
  permanentid?: string;
  /**
   * The urihash of the result, a unique identifier of a result. Used only for backwards compatibility.
   */
  urihash?: string;
}

export interface SearchResult {
  /**
   * The title of the search result.
   */
  title: string;
  /**
   * Some raw fields that are needed to identify a result.
   */
  raw: SearchResultRaw;
}

/**
 * The AttachToCase controller is responsible for handling the attach and detach actions on a specific result.
 * It also provides a function `isAttached` to verify if currently a specific result is part of the attachedResults state.
 */
export interface AttachToCase extends Controller {
  /**
   * Check if a specific result is part of the list of AttachedResults in the state.
   * @param result A result to check if attached, with SearchAPI fields
   */
  isAttached(result: SearchResult): boolean;
  /**
   * Attach a new result by adding it to the attachedResults state.
   * @param result A result to add to the list of currently attached results.
   */
  attach(result: AttachedResult): void;
  /**
   * Detach a result by removing it from the attachedResults state.
   * @param result A result to remove from the list of currently attached results.
   */
  detach(result: AttachedResult): void;
}

export function buildAttachToCase(engine: InsightEngine): AttachToCase {
  if (!loadAttachedResultsReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;

  const getState = () => engine.state.attachedResults;

  const isResultAttached = (result: SearchResult) => {
    let attached = false;
    if (result.raw.permanentid || result.raw.urihash) {
      attached = engine.state.attachedResults.results.some((attached) => {
        const permanentIdMatches =
          attached.permanentId &&
          attached.permanentId === result.raw.permanentid;
        const uriHashMatches =
          attached.uriHash && attached.uriHash === result.raw.urihash;
        return permanentIdMatches || uriHashMatches;
      });
    }
    return attached;
  };

  return {
    ...controller,

    get state() {
      return getState();
    },

    isAttached(result) {
      return isResultAttached(result);
    },

    attach(result) {
      dispatch(attachResult({result}));
    },

    detach(result) {
      dispatch(detachResult({result}));
    },
  };
}

function loadAttachedResultsReducers(
  engine: InsightEngine
): engine is InsightEngine<ConfigurationSection & AttachedResultsSection> {
  engine.addReducers({configuration, attachedResults});
  return true;
}
