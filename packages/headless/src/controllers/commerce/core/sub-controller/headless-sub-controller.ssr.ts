import {ensureAtLeastOneSolutionType} from '../../../../app/commerce-ssr-engine/common';
import {
  ControllerDefinitionOption,
  SolutionType,
  SubControllerDefinitionWithoutProps,
} from '../../../../app/commerce-ssr-engine/types/common';
import type {Summary} from '../../core/summary/headless-core-summary';
import {buildProductListing} from '../../product-listing/headless-product-listing';
import type {ProductListingSummaryState} from '../../product-listing/summary/headless-product-listing-summary';
import {buildSearch} from '../../search/headless-search';
import {SearchSummaryState} from '../../search/summary/headless-search-summary';

export type {ProductListingSummaryState, Summary};

export function defineQuerySummary<
  TOptions extends ControllerDefinitionOption | undefined,
>(options?: TOptions) {
  ensureAtLeastOneSolutionType(options);
  return {
    ...options,
    build: (engine, solutionType) =>
      solutionType === SolutionType.Listing
        ? buildProductListing(engine).summary()
        : buildSearch(engine).summary(),
  } as SubControllerDefinitionWithoutProps<
    Summary<ProductListingSummaryState & SearchSummaryState>, // TODO: fix conditional typing to return the appropriate type based on current solution type
    TOptions
  >;
}
