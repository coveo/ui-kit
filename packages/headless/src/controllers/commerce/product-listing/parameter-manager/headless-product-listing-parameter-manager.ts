import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {productListingParametersDefinition} from '../../../../features/commerce/search-parameters/search-parameter-schema';
import {
  buildCoreParameterManager,
  ParameterManager,
  ParameterManagerProps,
} from '../../core/parameter-manager/headless-core-parameter-manager';
import {
  ProductListingParameters,
  restoreProductListingParameters
} from '../../../../features/commerce/product-listing-parameters/product-listing-parameter-actions';
import {
  activeParametersSelector,
  initialParametersSelector
} from '../../../../features/commerce/search-parameters/search-parameter-selectors';

/**
 * Creates a `ParameterManager` controller instance for commerce listings.
 *
 * @param engine - The headless commerce engine.
 * @param props - The configurable `ParameterManager` controller properties.
 * @returns A `ParameterManager` controller instance.
 */
export function buildProductListingParameterManager(
  engine: CommerceEngine,
  props: ParameterManagerProps<ProductListingParameters>
): ParameterManager<ProductListingParameters> {
  return buildCoreParameterManager(engine, {
    ...props,
    parametersDefinition: productListingParametersDefinition,
    activeParametersSelector,
    restoreActionCreator: restoreProductListingParameters,
    fetchProductsActionCreator: fetchProductListing,
    enrichParameters: (state, activeParams) => ({
      ...initialParametersSelector(state),
      ...activeParams,
    }),
  });
}