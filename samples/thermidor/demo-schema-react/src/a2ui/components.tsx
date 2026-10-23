import {Catalog} from '@copilotkit/a2ui-renderer';
import {CONVERSATIONAL_CATALOG_ID} from '@coveo/thermidor-schema/zod3';
export {CONVERSATIONAL_CATALOG_ID};
import {ProductCarousel} from './ProductCarousel/ProductCarousel.js';
import {NextActionsBar} from './NextActionsBar/NextActionsBar.js';
import {BundleDisplay} from './BundleDisplay/BundleDisplay.js';
import {ComparisonTable} from './ComparisonTable/ComparisonTable.js';
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

export interface ThermidorCatalogOptions {
  productResearchCard?: ProductResearchCardOptions;
}

export function createThermidorCatalog(options: ThermidorCatalogOptions = {}) {
  return new Catalog(CONVERSATIONAL_CATALOG_ID, [
    ProductCarousel,
    NextActionsBar,
    BundleDisplay,
    ComparisonTable,
    ProductList,
    ProductSummary,
    createProductResearchCard(options.productResearchCard),
    Pagination,
    Sort,
    RegularFacet,
    NumericFacet,
    CategoryFacet,
    FacetManager,
    CommerceSearch,
    LayoutStack,
    QuerySummary,
    PageSize,
    Breadbox,
  ]);
}
