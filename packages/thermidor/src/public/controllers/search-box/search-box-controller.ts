import {BaseController} from '@/src/internal/utils/index.js';
import type {Supports, EndpointThunk} from '@/src/internal/utils/index.js';
import {createMemoizedStateSelector} from '@/src/internal/utils/index.js';
import {getHandleInternals} from '@/src/internal/utils/index.js';
import {getOrCreateSearchBoxActions} from '@/src/internal/features/search-box/index.js';
import {getOrCreateSearchBoxSelectors} from '@/src/internal/features/search-box/index.js';
import {getOrCreateSearchBoxSlice} from '@/src/internal/features/search-box/index.js';
import {getOrCreateSearchEndpointSelectors} from '@/src/internal/api/search/index.js';
import type {Controller} from '@/src/public/controllers/controller-types.js';

class SearchBoxControllerImpl extends BaseController<SearchBoxControllerState> {
  #thunks: EndpointThunk[];
  #actions: ReturnType<typeof getOrCreateSearchBoxActions>;

  constructor(options: SearchBoxControllerOptions) {
    const {engine, resolveFacades} = getHandleInternals(options.interface);

    engine.adoptSlice(getOrCreateSearchBoxSlice(options.interface));

    const selectors = getOrCreateSearchBoxSelectors(options.interface);
    const endpointSelectors = getOrCreateSearchEndpointSelectors(options.interface);

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

    this.#thunks = resolveFacades('search');
    this.#actions = getOrCreateSearchBoxActions(options.interface);
  }

  setQuery({query}: SearchBoxControllerSetQueryOptions): void {
    this.engine.mutate(this.#actions.setQuery(query));
  }

  submit(): Promise<unknown[]> {
    return Promise.all(
      this.#thunks.map((thunk) => this.engine.mutate(thunk({engine: this.engine})))
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
