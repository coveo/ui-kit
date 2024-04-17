import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {defaultSolutionTypeId} from '../../../../features/commerce/common/actions';
import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {
  ProductListingParameters,
  restoreProductListingParameters,
} from '../../../../features/commerce/search-parameters/search-parameter-actions';
import {productListingParametersDefinition} from '../../../../features/commerce/search-parameters/search-parameter-schema';
import {
  buildCoreParameterManager,
  ParameterManager,
  ParameterManagerProps,
} from '../../core/parameter-manager/headless-core-parameter-manager';

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
    fetchResultsActionCreator: () =>
      fetchProductListing({solutionTypeId: defaultSolutionTypeId}),
    enrichParameters: () => ({}),
  });
}

function activeParametersSelector(
  _state: CommerceEngine['state']
): ProductListingParameters {
  // eslint-disable-next-line @cspell/spellchecker
  // TODO CAPI-546: Handle facets, sort, and pagination
  return {};
}
