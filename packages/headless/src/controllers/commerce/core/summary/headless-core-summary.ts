import type {CommerceAPIErrorStatusResponse} from '../../../../api/commerce/commerce-api-error-response.js';
import type {
  CommerceEngine,
  CommerceEngineState,
} from '../../../../app/commerce-engine/commerce-engine.js';
import {stateKey} from '../../../../app/state-key.js';
import {
  buildController,
  type Controller,
} from '../../../controller/headless-controller.js';

export interface SummaryState {
  /**
   * The position of the first product on the current page.
   */
  firstProduct: number;
  /**
   * The position of the last product on the current page.
   */
  lastProduct: number;
  /**
   * Whether the first request has been executed.
   */
  firstRequestExecuted: boolean;
  /**
   * The total number of products available.
   */
  totalNumberOfProducts: number;
  /**
   * Whether the request has returned any products.
   */
  hasProducts: boolean;
  /**
   * Whether the request is currently loading.
   */
  isLoading: boolean;
  /**
   * Whether the request has returned an error.
   */
  hasError: boolean;
}

/**
 * The `Summary` sub-controller manages a summary of the current search results.
 */
export interface Summary<State extends SummaryState = SummaryState>
  extends Controller {
  /**
   * A scoped and simplified part of the headless state that is relevant to the `SearchSummary` sub-controller.
   */
  state: State;
}

export interface SummaryOptions<State extends SummaryState> {
  numberOfProductsSelector: (state: CommerceEngineState) => number;
  responseIdSelector: (state: CommerceEngineState) => string;
  isLoadingSelector: (state: CommerceEngineState) => boolean;
  errorSelector: (
    state: CommerceEngineState
  ) => CommerceAPIErrorStatusResponse | null | undefined;
  pageSelector: (state: CommerceEngineState) => number;
  perPageSelector: (state: CommerceEngineState) => number;
  totalEntriesSelector: (state: CommerceEngineState) => number;
  enrichSummary?: (state: CommerceEngineState) => Partial<State>;
}

interface SummaryProps<State extends SummaryState> {
  options: SummaryOptions<State>;
}

/**
 * Creates a `Summary` sub-controller.
 *
 * @param engine - The headless commerce engine.
 * @param props - The configurable `Summary` properties.
 * @returns A `Summary` sub-controller.
 */
export const buildCoreSummary = <State extends SummaryState = SummaryState>(
  engine: CommerceEngine,
  props: SummaryProps<State>
): Summary<State> => {
  const controller = buildController(engine);
  const {
    options: {
      numberOfProductsSelector,
      responseIdSelector,
      isLoadingSelector,
      errorSelector,
      pageSelector,
      perPageSelector,
      totalEntriesSelector,
      enrichSummary,
    },
  } = props;

  const getState = () => engine[stateKey];
  const page = () => pageSelector(getState());
  const perPage = () => perPageSelector(getState());
  const totalNumberOfProducts = () => totalEntriesSelector(getState());

  const firstSearchExecuted = () => !!responseIdSelector(getState());

  const hasProducts = () =>
    firstSearchExecuted() && totalNumberOfProducts() > 0;

  const firstProduct = () => (hasProducts() ? page() * perPage() + 1 : 0);

  const lastProduct = () =>
    hasProducts()
      ? firstProduct() + (numberOfProductsSelector(getState()) - 1)
      : 0;

  return {
    ...controller,
    get state(): State {
      return {
        firstRequestExecuted: firstSearchExecuted(),
        firstProduct: firstProduct(),
        lastProduct: lastProduct(),
        totalNumberOfProducts: totalNumberOfProducts(),
        hasProducts: hasProducts(),
        isLoading: isLoadingSelector(getState()),
        hasError: errorSelector(getState()) !== null,
        ...(enrichSummary ? enrichSummary(getState()) : {}),
      } as State;
    },
  };
};
