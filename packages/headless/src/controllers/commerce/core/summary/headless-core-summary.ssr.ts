import {ensureAtLeastOneSolutionType} from '../../../../app/commerce-ssr-engine/common.js';
import {
  ControllerDefinitionOption,
  SolutionType,
  SubControllerDefinitionWithoutProps,
} from '../../../../app/commerce-ssr-engine/types/common.js';
import {buildProductListing} from '../../product-listing/headless-product-listing.js';
import {ProductListingSummaryState} from '../../product-listing/summary/headless-product-listing-summary.js';
import {RecommendationsSummaryState} from '../../recommendations/summary/headless-recommendations-summary.js';
import {buildSearch} from '../../search/headless-search.js';
import {SearchSummaryState} from '../../search/summary/headless-search-summary.js';
import {Summary, SummaryState} from './headless-core-summary.js';

export type {
  Summary,
  ProductListingSummaryState,
  RecommendationsSummaryState,
  SearchSummaryState,
  SummaryState,
};

/**
 * Defines a `Summary` controller instance.
 *
 * @returns The `Summary` controller definition.
 *
 * @internal
 */
export function defineSummary<
  TOptions extends ControllerDefinitionOption | undefined,
>(options?: TOptions) {
  ensureAtLeastOneSolutionType(options);
  return {
    ...options,
    build: (engine, solutionType) =>
      solutionType === SolutionType.listing
        ? buildProductListing(engine).summary()
        : buildSearch(engine).summary(),
  } as SubControllerDefinitionWithoutProps<Summary, TOptions>;
}
