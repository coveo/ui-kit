import {
  getFullEngine,
  searchBoxSelectors,
  searchBoxMutators,
  loadSearchBox,
} from '@/src/core/index.js';
import {SearchEndpointFacade} from '@/src/api/index.js';
import {
  Controller,
  ControllerOptions,
} from '@/src/public/controllers/controller-types.js';

/**
 * Builds a `SearchBoxController` instance.
 * @param options - The options to build the controller.
 * @returns A `SearchBoxController` instance.
 */
export const buildSearchBoxController: (
  options: SearchBoxControllerOptions
) => SearchBoxController = (options) => {
  const fullEngine = getFullEngine(options.engine);
  loadSearchBox(fullEngine);

  const facade = SearchEndpointFacade.getInstance(fullEngine);

  const stateSelect = () => ({
    query: fullEngine.read(searchBoxSelectors.getQuery),
  });

  return {
    setQuery: (options: SetQueryOptions) => {
      fullEngine.mutate(searchBoxMutators.setQuery(options.query));
    },
    submit: () => {
      facade.callEndpoint();
    },
    get state() {
      return stateSelect();
    },
    subscribe(callback: () => void) {
      return fullEngine.subscribe(stateSelect, callback);
    },
  };
};

export interface SearchBoxControllerOptions extends ControllerOptions {}

export interface SearchBoxController extends Controller {
  /**
   * Updates the search query.
   *
   * @param options - The options for setting the query.
   */
  setQuery(options: SetQueryOptions): void;

  /**
   * Executes the search query.
   */
  submit(): void;

  readonly state: SearchBoxControllerState;
}

export interface SetQueryOptions {
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
}
