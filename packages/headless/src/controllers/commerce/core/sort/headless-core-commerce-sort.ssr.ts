import {SSRCommerceEngine} from '../../../../app/commerce-engine/commerce-engine.ssr';
import {ensureAtLeastOneSolutionType} from '../../../../app/commerce-ssr-engine/common';
import {
  ControllerDefinitionOption,
  DefinedSolutionTypes,
  SolutionType,
  SubControllerDefinitionWithoutProps,
} from '../../../../app/commerce-ssr-engine/types/common';
import {buildProductListing} from '../../product-listing/headless-product-listing';
import {buildSearch} from '../../search/headless-search';
import {Sort, SortProps, SortState} from './headless-core-commerce-sort';

export type {Sort, SortProps, SortState};

export function defineSort<
  TOptions extends ControllerDefinitionOption | undefined,
>(props?: SortProps, options?: TOptions) {
  ensureAtLeastOneSolutionType(options);
  return {
    ...options,
    build: (
      engine: SSRCommerceEngine,
      solutionType: DefinedSolutionTypes<typeof options>
    ) =>
      solutionType === SolutionType.listing
        ? buildProductListing(engine).sort(props)
        : buildSearch(engine).sort(props),
  } as SubControllerDefinitionWithoutProps<Sort, TOptions>;
}
