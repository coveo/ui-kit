import {ensureAtLeastOneSolutionType} from '../../../../app/commerce-ssr-engine/common';
import {
  ControllerDefinitionOption,
  SolutionType,
  SubControllerDefinitionWithoutProps,
} from '../../../../app/commerce-ssr-engine/types/common';
import {buildProductListing} from '../../product-listing/headless-product-listing';
import {ProductListingSummaryState} from '../../product-listing/summary/headless-product-listing-summary';
import {RecommendationsSummaryState} from '../../recommendations/summary/headless-recommendations-summary';
import {buildSearch} from '../../search/headless-search';
import {SearchSummaryState} from '../../search/summary/headless-search-summary';
import {Summary, SummaryState} from './headless-core-summary';

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
