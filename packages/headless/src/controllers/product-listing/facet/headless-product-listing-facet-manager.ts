import {ProductListingEngine} from '../../../app/product-listing-engine/product-listing-engine';
import {facetOptionsReducer as facetOptions} from '../../../features/facet-options/facet-options-slice';
import {productListingReducer as productListing} from '../../../features/product-listing/product-listing-slice';
import {OldProductListingSection} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {sortFacets} from '../../../utils/facet-utils';
import {buildController} from '../../controller/headless-controller';
import {
  FacetManager,
  FacetManagerPayload,
  FacetManagerState,
} from '../../core/facet-manager/headless-core-facet-manager';

export type {FacetManager, FacetManagerState, FacetManagerPayload};

/**
 * Creates a `FacetManager` instance for the product listing.
 *
 * Deprecated. The `product-listing` sub-package is deprecated. Use the `commerce` sub-package instead.
 * @internal
 *
 * @param productListingEngine - The headless engine.
 */
export function buildFacetManager(
  productListingEngine: ProductListingEngine
): FacetManager {
  if (!loadFacetManagerReducers(productListingEngine)) {
    throw loadReducerError;
  }

  const controller = buildController(productListingEngine);
  const getState = () => productListingEngine.state;

  return {
    ...controller,

    sort<T>(facets: FacetManagerPayload<T>[]) {
      return sortFacets(facets, this.state.facetIds);
    },

    get state() {
      const facets = getState().productListing.facets.results;
      const facetIds = facets.map((f) => f.facetId);

      return {facetIds};
    },
  };
}

function loadFacetManagerReducers(
  productListingEngine: ProductListingEngine
): productListingEngine is ProductListingEngine<OldProductListingSection> {
  productListingEngine.addReducers({productListing, facetOptions});
  return true;
}
