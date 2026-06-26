import {BaseController} from '@/src/core/interface/base-controller.js';
import type {
  Supports,
  EndpointThunk,
} from '@/src/core/interface/utils/interface-types.js';
import type {Dispatchable} from '@/src/core/interface/engine/engine-types.js';
import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {ENGINE, STATE_ID} from '@/src/core/interface/utils/symbols.js';
import {getOrCreateSearchBoxActions} from '@/src/core/internal/search-box/search-box-actions.js';
import {getOrCreateSearchBoxSelectors} from '@/src/core/internal/search-box/search-box-selectors.js';
import {getOrCreateSearchBoxSlice} from '@/src/core/internal/search-box/search-box-slice.js';
import {getOrCreateSearchEndpointSelectors} from '@/src/core/internal/api/search/search-thunk-slice.js';
import type {Controller} from '@/src/public/controllers/controller-types.js';

class SearchBoxControllerImpl extends BaseController<SearchBoxControllerState> {
  #thunks: EndpointThunk[];
  #actions: ReturnType<typeof getOrCreateSearchBoxActions>;

  constructor(options: SearchBoxControllerOptions) {
    const engine = options.interface[ENGINE];
    const stateId = options.interface[STATE_ID];

    engine.adoptSlice(getOrCreateSearchBoxSlice(stateId));

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

    super(engine, controllerState);

    this.#thunks = options.interface.resolveFacades('search');
    this.#actions = getOrCreateSearchBoxActions(stateId);
  }

  setQuery({query}: SearchBoxControllerSetQueryOptions): void {
    this.engine.mutate(this.#actions.setQuery(query));
  }

  submit(): Promise<unknown[]> {
    return Promise.all(
      this.#thunks.map((thunk) =>
        this.engine.mutate(thunk({engine: this.engine}) as Dispatchable)
      )
    );
  }
}

export const buildSearchBoxController = (
  options: SearchBoxControllerOptions
): SearchBoxController => new SearchBoxControllerImpl(options);

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
