import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {
  errorSelector,
  isLoadingSelector,
  numberOfProductsSelector,
  responseIdSelector,
} from '../../../../features/commerce/product-listing/product-listing-selectors';
import {loadReducerError} from '../../../../utils/errors';
import {
  Summary,
  SummaryState,
  buildCoreSummary,
} from '../../core/summary/headless-core-summary';
import {loadProductListingReducer} from '../utils/load-product-listing-reducers';

export interface ListingSummaryState extends SummaryState {}

export interface ListingSummary extends Summary {
  /**
   * A scoped and simplified part of the headless state that is relevant to the `ListingSummary` controller.
   */
  state: ListingSummaryState;
}

/**
 * Builds a `ListingSummary` controller.
 * @param engine
 * @returns
 */
export const buildListingSummary = (engine: CommerceEngine) => {
  if (!loadProductListingReducer(engine)) {
    throw loadReducerError;
  }

  return buildCoreSummary(engine, {
    options: {
      selectNumProducts: numberOfProductsSelector,
      selectResponseId: responseIdSelector,
      selectLoading: isLoadingSelector,
      selectError: errorSelector,
    },
  });
};
