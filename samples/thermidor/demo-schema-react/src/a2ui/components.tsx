import {Catalog} from '@copilotkit/a2ui-renderer';
import {THERMIDOR_CATALOG_ID} from '@coveo/thermidor-schema/zod3';
export {THERMIDOR_CATALOG_ID};
import {ProductCarousel} from './ProductCarousel/ProductCarousel.js';
import {NextActionsBar} from './NextActionsBar/NextActionsBar.js';
import {BundleDisplay} from './BundleDisplay/BundleDisplay.js';
import {
  createComparisonTable,
  type ComparisonTableOptions,
} from './ComparisonTable/ComparisonTable.js';
import {ProductList} from './ProductList/ProductList.js';
import {ProductSummary} from './ProductSummary/ProductSummary.js';
import {
  createProductResearchCard,
  type ProductResearchCardOptions,
} from './ProductResearchCard/ProductResearchCard.js';
import {Pagination} from './Pagination/Pagination.js';
import {Sort} from './Sort/Sort.js';
import {RegularFacet} from './RegularFacet/RegularFacet.js';
import {NumericFacet} from './NumericFacet/NumericFacet.js';
import {CategoryFacet} from './CategoryFacet/CategoryFacet.js';
import {FacetManager} from './FacetManager/FacetManager.js';
import {CommerceSearch} from './CommerceSearch/CommerceSearch.js';
import {LayoutStack} from './LayoutStack/LayoutStack.js';
import {QuerySummary} from './QuerySummary/QuerySummary.js';
import {PageSize} from './PageSize/PageSize.js';
import {Breadbox} from './Breadbox/Breadbox.js';
import {SessionShell} from './SessionShell/SessionShell.js';
import {SearchBox} from './SearchBox/SearchBox.js';
import {QuerySuggestions} from './QuerySuggestions/QuerySuggestions.js';
import {InstantProducts} from './InstantProducts/InstantProducts.js';
import {actsOnSurface} from './surface-controls.js';

export interface ThermidorCatalogOptions {
  comparisonTable?: ComparisonTableOptions;
  productResearchCard?: ProductResearchCardOptions;
}

export function createThermidorCatalog(options: ThermidorCatalogOptions = {}) {
  return new Catalog(THERMIDOR_CATALOG_ID, [
    ProductCarousel,
    actsOnSurface(NextActionsBar),
    BundleDisplay,
    createComparisonTable(options.comparisonTable),
    ProductList,
    ProductSummary,
    createProductResearchCard(options.productResearchCard),
    actsOnSurface(Pagination),
    actsOnSurface(Sort),
    actsOnSurface(RegularFacet),
    actsOnSurface(NumericFacet),
    actsOnSurface(CategoryFacet),
    FacetManager,
    CommerceSearch,
    LayoutStack,
    actsOnSurface(QuerySummary),
    actsOnSurface(PageSize),
    actsOnSurface(Breadbox),
    SessionShell,
    SearchBox,
    actsOnSurface(QuerySuggestions),
    InstantProducts,
  ]);
}
