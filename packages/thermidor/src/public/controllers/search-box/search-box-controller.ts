import type {Supports} from '@/src/core/interface/utils/interface-types.js';
import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {ENGINE, STATE_ID} from '@/src/core/interface/utils/symbols.js';
import {resolveFacades} from '@/src/core/interface/utils/resolve-facades.js';
import {getOrCreateSearchBoxActions} from '@/src/core/internal/search-box/search-box-actions.js';
import {getOrCreateSearchBoxSelectors} from '@/src/core/internal/search-box/search-box-selectors.js';
import {getOrCreateSearchBoxSlice} from '@/src/core/internal/search-box/search-box-slice.js';
import {getOrCreateSearchEndpointSelectors} from '@/src/core/internal/api/search/search-thunk-slice.js';
import type {Controller} from '@/src/public/controllers/controller-types.js';

/**
 * Builds a `SearchBoxController` instance.
 * @param options - The options to build the controller.
 * @returns A `SearchBoxController` instance.
 */
export const buildSearchBoxController: (
  options: SearchBoxControllerOptions
) => SearchBoxController = (options) => {
  const engine = options.interface[ENGINE];
  const stateId = options.interface[STATE_ID];

  engine.adoptSlice(getOrCreateSearchBoxSlice(stateId));

  const thunks = resolveFacades(options.interface, 'search');

  const actions = getOrCreateSearchBoxActions(stateId);
  const selectors = getOrCreateSearchBoxSelectors(stateId);
  const endpointSelectors = getOrCreateSearchEndpointSelectors(stateId);

  const controllerState = createMemoizedStateSelector(
    selectors.getQuery,
    endpointSelectors.getStatus,
    endpointSelectors.getError,
    (query, status, error) => ({
      query,
      isLoading: status === 'pending',
      error,
    })
  );

  return {
    setQuery({query}: SearchBoxControllerSetQueryOptions) {
      engine.mutate(actions.setQuery(query));
    },
    submit() {
      return Promise.all(thunks.map((thunk) => engine.mutate(thunk({engine}))));
    },
    get state() {
      return engine.read(controllerState);
    },
    subscribe(callback) {
      return engine.subscribe(controllerState, callback);
    },
  };
};

export interface SearchBoxControllerOptions {
  interface: Supports<'search'>;
}

export interface SearchBoxController extends Controller<SearchBoxControllerState> {
  /**
   * Updates the search query.
   *
   * @param options - The options for setting the query.
   */
  setQuery(options: SearchBoxControllerSetQueryOptions): void;

  /**
   * Executes the search query.
   */
  submit(): Promise<unknown[]>;
}

export interface SearchBoxControllerSetQueryOptions {
  /**
   * The new search query.
   */
  query: string;
}

export interface SearchBoxControllerState {
  /**
   * The current search query.
   */
  query: string;

  /**
   * Whether a search request is currently in flight.
   */
  isLoading: boolean;

  /**
   * The error message from the last failed search request, or null.
   */
  error: string | null;
}
