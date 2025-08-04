import type {
  Summary,
  SummaryState,
} from '../../../../controllers/commerce/core/summary/headless-core-summary.js';
import {buildProductListing} from '../../../../controllers/commerce/product-listing/headless-product-listing.js';
import type {ProductListingSummaryState} from '../../../../controllers/commerce/product-listing/summary/headless-product-listing-summary.js';
import type {RecommendationsSummaryState} from '../../../../controllers/commerce/recommendations/summary/headless-recommendations-summary.js';
import {buildSearch} from '../../../../controllers/commerce/search/headless-search.js';
import type {SearchSummaryState} from '../../../../controllers/commerce/search/summary/headless-search-summary.js';
import {ensureAtLeastOneSolutionType} from '../../../../ssr/commerce/controller-utils.js';
import {SolutionType} from '../../types/controller-constants.js';
import type {
  ControllerDefinitionOption,
  SubControllerDefinitionWithoutProps,
} from '../../types/controller-definitions.js';

export type {
  Summary,
  ProductListingSummaryState,
  RecommendationsSummaryState,
  SearchSummaryState,
  SummaryState,
};

/**
 * Defines a `Summary` controller instance.
 * @group Definers
 *
 * @returns The `Summary` controller definition.
 */
export function defineSummary<
  TOptions extends ControllerDefinitionOption | undefined,
>(options?: TOptions) {
  ensureAtLeastOneSolutionType(options);
  return {
    listing: true,
    search: true,
    ...options,
    build: (engine, solutionType) =>
      solutionType === SolutionType.listing
        ? buildProductListing(engine).summary()
        : buildSearch(engine).summary(),
  } as SubControllerDefinitionWithoutProps<
    Summary<
      | ProductListingSummaryState
      | SearchSummaryState
      | RecommendationsSummaryState
    >,
    TOptions
  >;
}
