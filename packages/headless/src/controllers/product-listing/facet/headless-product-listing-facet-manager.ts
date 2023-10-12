import {ProductListingEngine} from '../../../app/product-listing-engine/product-listing-engine.js';
import {facetOptionsReducer as facetOptions} from '../../../features/facet-options/facet-options-slice.js';
import {productListingReducer as productListing} from '../../../features/product-listing/product-listing-slice.js';
import {ProductListingSection} from '../../../state/state-sections.js';
import {loadReducerError} from '../../../utils/errors.js';
import {sortFacets} from '../../../utils/facet-utils.js';
import {buildController} from '../../controller/headless-controller.js';
import {
  FacetManager,
  FacetManagerPayload,
  FacetManagerState,
} from '../../core/facet-manager/headless-core-facet-manager.js';

export type {FacetManager, FacetManagerState, FacetManagerPayload};

/**
 * Creates a `FacetManager` instance for the product listing.
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
): productListingEngine is ProductListingEngine<ProductListingSection> {
  productListingEngine.addReducers({productListing, facetOptions});
  return true;
}
