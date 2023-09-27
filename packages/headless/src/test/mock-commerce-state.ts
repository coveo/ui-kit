import {getProductListingV2InitialState} from '../features/commerce/product-listing/product-listing-state';
import {getConfigurationInitialState} from '../features/configuration/configuration-state';
import {CommerceAppState} from '../state/commerce-app-state';

export function buildMockCommerceState(
  config: Partial<CommerceAppState> = {}
): CommerceAppState {
  return {
    configuration: getConfigurationInitialState(),
    productListing: getProductListingV2InitialState(),
    version: 'unit-testing-version',
    ...config,
  };
}
