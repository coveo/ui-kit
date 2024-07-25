import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {ControllerDefinitionWithoutProps} from '../../../../app/ssr-engine/types/common';
import {buildProductListing} from '../../product-listing/headless-product-listing';
import {ProductListingSummaryState} from '../../product-listing/summary/headless-product-listing-summary';
import {Summary} from '../summary/headless-core-summary';

export type {ProductListingSummaryState, Summary};

export interface SummaryDefinition
  extends ControllerDefinitionWithoutProps<
    CommerceEngine,
    Summary<ProductListingSummaryState>
  > {}

/**
 *
 * @internal
 *
 */
export function defineQuerySummary(): SummaryDefinition {
  return {
    build: (engine) => buildProductListing(engine).summary(),
  };
}
