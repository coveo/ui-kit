import {ensureAtLeastOneSolutionType} from '../../../../app/commerce-ssr-engine/common.js';
import {
  ControllerDefinitionOption,
  SolutionType,
  SubControllerDefinitionWithoutProps,
} from '../../../../app/commerce-ssr-engine/types/common.js';
import type {Summary} from '../../core/summary/headless-core-summary.js';
import {buildProductListing} from '../../product-listing/headless-product-listing.js';
import type {ProductListingSummaryState} from '../../product-listing/summary/headless-product-listing-summary.js';
import {buildSearch} from '../../search/headless-search.js';
import {SearchSummaryState} from '../../search/summary/headless-search-summary.js';

export type {ProductListingSummaryState, Summary};

export function defineQuerySummary<
  TOptions extends ControllerDefinitionOption | undefined,
>(options?: TOptions) {
  ensureAtLeastOneSolutionType(options);
  return {
    ...options,
    build: (engine, solutionType) =>
      solutionType === SolutionType.listing
        ? buildProductListing(engine).summary()
        : buildSearch(engine).summary(),
    // TODO: KIT-3503: support recommendation summary
  } as SubControllerDefinitionWithoutProps<
    Summary<ProductListingSummaryState & SearchSummaryState>, // TODO: fix conditional typing to return the appropriate type based on current solution type
    TOptions
  >;
}
