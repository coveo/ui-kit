import {ensureAtLeastOneSolutionType} from '../../../../app/commerce-ssr-engine/common';
import {
  ControllerDefinitionOption,
  SolutionType,
  SubControllerDefinitionWithoutProps,
} from '../../../../app/commerce-ssr-engine/types/common';
import {buildProductListing} from '../../product-listing/headless-product-listing';
import {buildSearch} from '../../search/headless-search';
import {Summary, SummaryState} from './headless-core-summary';

export type {Summary, SummaryState};

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
