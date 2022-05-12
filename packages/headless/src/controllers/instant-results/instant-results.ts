import {SearchEngine} from '../../app/search-engine/search-engine';
import {Result} from '../../api/search/search/result';
import {InstantResultSection} from '../../state/state-sections';
import {buildController, Controller} from '../controller/headless-controller';
import {instantResults} from '../../app/reducers';
import {loadReducerError} from '../../utils/errors';
import {validateOptions} from '../../utils/validate-payload';
import {
  fetchInstantResults,
  registerInstantResults,
  updateInstantResultsQuery,
} from '../../features/instant-results/instant-results-actions';
import {
  InstantResultOptions,
  instantResultsOptionsSchema,
} from './instant-results-options';
import {SearchAPIErrorWithStatusCode} from '../../api/search/search-api-error-response';
import {SerializedError} from '@reduxjs/toolkit';

export interface InstantResultProps {
  options: InstantResultOptions;
}

export interface InstantResults extends Controller {
  /**
   * Updates the instant results query and shows instant results for it.
   *
   * @param q - The string value to get instant results for.
   *
   */
  updateQuery(q: string): void;
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
   * The instant results for the current query in instant results.
   */
  results: Result[];
  /**
   * Determines if a search is in progress for the current instant results query.
   */
  isLoading: boolean;
  /**
   * Determines if a search is in progress for the current instant results query.
   */
  error: SearchAPIErrorWithStatusCode | SerializedError | null;
}

/**
 * Creates a `InstantResults` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `InstantResults` properties.
 * @returns A `InstantResults` controller instance.
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
    if (!cached) return [];
    if (cached.isLoading) {
      return [];
    }
    return cached.results;
  };

  return {
    ...controller,

    updateQuery(q: string) {
      const cached = getCached(q);
      if (!q) return;
      if (!cached || cached.error) {
        dispatch(fetchInstantResults({id: searchBoxId, q}));
      }
      dispatch(updateInstantResultsQuery({id: searchBoxId, q}));
    },

    get state() {
      return {
        q: getQ(),
        isLoading: getCached(getQ())?.isLoading,
        error: getCached(getQ())?.error,
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
