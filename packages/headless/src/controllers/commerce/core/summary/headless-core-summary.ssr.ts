import {ensureAtLeastOneSolutionType} from '../../../../app/commerce-ssr-engine/common.js';
import {
  type ControllerDefinitionOption,
  SolutionType,
  type SubControllerDefinitionWithoutProps,
} from '../../../../app/commerce-ssr-engine/types/common.js';
import {buildProductListing} from '../../product-listing/headless-product-listing.js';
import type {ProductListingSummaryState} from '../../product-listing/summary/headless-product-listing-summary.js';
import type {RecommendationsSummaryState} from '../../recommendations/summary/headless-recommendations-summary.js';
import {buildSearch} from '../../search/headless-search.js';
import type {SearchSummaryState} from '../../search/summary/headless-search-summary.js';
import type {Summary, SummaryState} from './headless-core-summary.js';

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
