import type {Summary} from '@coveo/headless/commerce';
import type {SummaryState} from '@coveo/headless/ssr-internal';
import {buildProductListing} from '@coveo/headless/commerce';
import type {ProductListingSummaryState} from '@coveo/headless/commerce';
import type {RecommendationsSummaryState} from '@coveo/headless/commerce';
import {buildSearch} from '@coveo/headless/commerce';
import type {SearchSummaryState} from '@coveo/headless/commerce';
import {SolutionType} from '../../types/controller-constants.js';
import type {SearchAndListingControllerDefinitionWithoutProps} from '../../types/controller-definitions.js';

export type {
  ProductListingSummaryState,
  RecommendationsSummaryState,
  SearchSummaryState,
  Summary,
  SummaryState,
};

export type SummaryDefinition = SearchAndListingControllerDefinitionWithoutProps<
  Summary<ProductListingSummaryState | SearchSummaryState | RecommendationsSummaryState>
>;

/**
 * Defines a `Summary` controller instance.
 * @group Definers
 *
 * @returns The `Summary` controller definition.
 */
export function defineSummary(): SummaryDefinition {
  return {
    listing: true,
    search: true,
    build: (engine, solutionType) =>
      solutionType === SolutionType.listing
        ? buildProductListing(engine).summary()
        : buildSearch(engine).summary(),
  };
}
