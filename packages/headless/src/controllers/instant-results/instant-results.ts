import {SearchEngine} from '../../app/search-engine/search-engine';
import {Result} from '../../api/search/search/result';
import {InstantResultSection} from '../../state/state-sections';
import {buildController, Controller} from '../controller/headless-controller';
import {instantResults} from '../../app/reducers';
import {loadReducerError} from '../../utils/errors';
import {validateOptions} from '../../utils/validate-payload';
import {
  clearExpiredResults,
  registerInstantResults,
  updateInstantResultsQuery,
} from '../../features/instant-results/instant-results-actions';
import {
  InstantResultOptions,
  instantResultsOptionsSchema,
} from './instant-results-options';
import {SearchAPIErrorWithStatusCode} from '../../api/search/search-api-error-response';
import {SerializedError} from '@reduxjs/toolkit';
import {fetchInstantResults} from '../../features/search/search-actions';
import {hasExpired} from '../../features/instant-results/instant-results-state';

export interface InstantResultProps {
  options: InstantResultOptions;
}

/**
 * The `InstantResults` controller allows the end user to manage instant results queries.
 */
export interface InstantResults extends Controller {
  /**
   * Updates the specified query and shows instant results for it.
   *
   * @param q - The query to get instant results for. For more precise instant results, query suggestions are recommended.
   */
  updateQuery(q: string): void;
  /**
   * Fetches results from the server for a query.
   */
  updateResultsForQuery(q: string): void;
  /**
   * Clears all expired instant results queries.
   */
  clearExpired(): void;
  /**
   * The state of the `InstantResults` controller.
   */
  state: InstantResultsState;
}

export interface InstantResultsState {
  /**
   * The current query for instant results.
   */
  q: string;
  /**
   * The instant results for the current query.
   */
  results: Result[];
  /**
   * Determines if a search is in progress for the current query.
   */
  isLoading: boolean;
  /**
   * An error returned when executing an instant results request, if any. This is `null` otherwise.
   */
  error: SearchAPIErrorWithStatusCode | SerializedError | null;
}

/**
 * Creates an `InstantResults` controller instance.
 *
 * @param engine - The Headless engine.
 * @param props - The configurable `InstantResults` properties.
 * @returns An `InstantResults` controller instance.
 */
export function buildInstantResults(
  engine: SearchEngine,
  props: InstantResultProps
): InstantResults {
  if (!loadInstantResultsReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;
  const getState = () => engine.state;

  const options: Required<InstantResultOptions> = {
    cacheTimeout: 6e4,
    ...props.options,
  };

  validateOptions(
    engine,
    instantResultsOptionsSchema,
    options,
    'buildInstantResults'
  );

  const searchBoxId = options.searchBoxId;
  dispatch(registerInstantResults({id: searchBoxId}));

  const getStateForSearchBox = () => getState().instantResults[searchBoxId];

  const getCached = (q: string) => getStateForSearchBox().cache[q];
  const getQ = () => getStateForSearchBox().q;
  const getResults = () => {
    const cached = getCached(getQ());
    if (!cached) {
      return [];
    }
    if (cached.isLoading) {
      return [];
    }
    return cached.results;
  };

  return {
    ...controller,

    updateResultsForQuery(q: string) {
      dispatch(
        fetchInstantResults({
          id: searchBoxId,
          q,
          maxResultsPerQuery: options.maxResultsPerQuery,
          cacheTimeout: options.cacheTimeout,
        })
      );
    },

    updateQuery(q: string) {
      if (!q) {
        return;
      }
      const cached = getCached(q);
      if (
        !cached ||
        (!cached.isLoading && (cached.error || hasExpired(cached)))
      ) {
        this.updateResultsForQuery(q);
      }
      dispatch(updateInstantResultsQuery({id: searchBoxId, q}));
    },

    clearExpired() {
      dispatch(
        clearExpiredResults({
          id: searchBoxId,
        })
      );
    },

    get state() {
      const q = getQ();
      const cached = getCached(q);
      return {
        q,
        isLoading: cached?.isLoading || false,
        error: cached?.error || null,
        results: getResults(),
      };
    },
  };
}

function loadInstantResultsReducers(
  engine: SearchEngine
): engine is SearchEngine<InstantResultSection> {
  engine.addReducers({instantResults: instantResults});
  return true;
}
