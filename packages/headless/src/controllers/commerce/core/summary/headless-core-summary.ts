import {CommerceAPIErrorStatusResponse} from '../../../../api/commerce/commerce-api-error-response';
import {CommerceEngineState} from '../../../../app/commerce-engine/commerce-engine';
import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {
  pagePrincipalSelector,
  perPagePrincipalSelector,
  totalEntriesPrincipalSelector,
} from '../../../../features/commerce/pagination/pagination-selectors';
import {
  Controller,
  buildController,
} from '../../../controller/headless-controller';

export interface SummaryState {
  /**
   * The number of the first product on the current page.
   */
  firstProduct: number;
  /**
   * The number of the last product on the current page.
   */
  lastProduct: number;
  /**
   * Whether the first search has been executed.
   */
  firstSearchExecuted: boolean;

  /**
   * The total number of products available.
   */
  totalNumberOfProducts: number;
  /**
   * Whether the search has returned any products.
   */
  hasProducts: boolean;
  /**
   * Whether the search is currently loading.
   */
  isLoading: boolean;
  /**
   * Whether the search has returned an error.
   */
  hasError: boolean;
}
export interface Summary extends Controller {
  /**
   * A scoped and simplified part of the headless state that is relevant to the `SearchSummary` controller.
   */
  state: SummaryState;
}

interface SummaryOptions {
  selectNumProducts: (state: CommerceEngineState) => number;
  selectResponseId: (state: CommerceEngineState) => string;
  selectLoading: (state: CommerceEngineState) => boolean;
  selectError: (
    state: CommerceEngineState
  ) => CommerceAPIErrorStatusResponse | null | undefined;
}

interface SummaryProps {
  options: SummaryOptions;
}

/**
 * Builds a `Summary` controller.
 *
 * @param engine - The headless commerce engine.
 * @returns A `Summary` controller.
 */
export const buildCoreSummary = (
  engine: CommerceEngine,
  props: SummaryProps
): Summary => {
  const controller = buildController(engine);
  const {
    options: {selectNumProducts, selectResponseId, selectLoading, selectError},
  } = props;

  const getState = () => engine.state;
  const page = () => pagePrincipalSelector(getState());
  const perPage = () => perPagePrincipalSelector(getState());
  const totalNumberOfProducts = () => totalEntriesPrincipalSelector(getState());

  const firstSearchExecuted = () => !!selectResponseId(getState());

  const hasProducts = () =>
    firstSearchExecuted() && totalNumberOfProducts() > 0;

  const firstProduct = () => (hasProducts() ? page() * perPage() + 1 : 0);

  const lastProduct = () =>
    hasProducts() ? firstProduct() + (selectNumProducts(getState()) - 1) : 0;

  return {
    ...controller,
    get state(): SummaryState {
      return {
        firstSearchExecuted: firstSearchExecuted(),
        firstProduct: firstProduct(),
        lastProduct: lastProduct(),
        totalNumberOfProducts: totalNumberOfProducts(),
        hasProducts: hasProducts(),
        isLoading: selectLoading(getState()),
        hasError: selectError(getState()) !== null,
      };
    },
  };
};
