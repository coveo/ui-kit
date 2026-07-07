import {BaseController} from '@/src/core/interface/base-controller.js';
import type {
  Supports,
  EndpointThunk,
} from '@/src/core/interface/utils/interface-types.js';
import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {getHandleInternals} from '@/src/core/interface/utils/get-handle-internals.js';
import {getOrCreateSearchBoxActions} from '@/src/core/internal/search-box/search-box-actions.js';
import {getOrCreateSearchBoxSelectors} from '@/src/core/internal/search-box/search-box-selectors.js';
import {getOrCreateSearchBoxSlice} from '@/src/core/internal/search-box/search-box-slice.js';
import {getOrCreateSearchEndpointSelectors} from '@/src/core/internal/api/search/search-thunk-slice.js';
import type {Controller} from '@/src/public/controllers/controller-types.js';

class SearchBoxControllerImpl extends BaseController<SearchBoxControllerState> {
  #thunks: EndpointThunk[];
  #actions: ReturnType<typeof getOrCreateSearchBoxActions>;

  constructor(options: SearchBoxControllerOptions) {
    const {engine} = getHandleInternals(options.interface);

    engine.adoptSlice(getOrCreateSearchBoxSlice(options.interface));

    const selectors = getOrCreateSearchBoxSelectors(options.interface);
    const endpointSelectors = getOrCreateSearchEndpointSelectors(
      options.interface
    );

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
    this.#actions = getOrCreateSearchBoxActions(options.interface);
  }

  setQuery({query}: SearchBoxControllerSetQueryOptions): void {
    this.engine.mutate(this.#actions.setQuery(query));
  }

  submit(): Promise<unknown[]> {
    return Promise.all(
      this.#thunks.map((thunk) =>
        this.engine.mutate(thunk({engine: this.engine}))
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
