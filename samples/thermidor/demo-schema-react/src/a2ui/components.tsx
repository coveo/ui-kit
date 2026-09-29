import {Catalog} from '@copilotkit/a2ui-renderer';
import {THERMIDOR_CATALOG_ID} from '@coveo/thermidor-schema/zod3';
export {THERMIDOR_CATALOG_ID};
import {ProductCarousel} from './ProductCarousel/ProductCarousel.js';
import {NextActionsBar} from './NextActionsBar/NextActionsBar.js';
import {BundleDisplay} from './BundleDisplay/BundleDisplay.js';
import {ComparisonTable} from './ComparisonTable/ComparisonTable.js';
import {ProductList} from './ProductList/ProductList.js';
import {ProductSummary} from './ProductSummary/ProductSummary.js';
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

const thermidorComponents = [
  ProductCarousel,
  NextActionsBar,
  BundleDisplay,
  ComparisonTable,
  ProductList,
  ProductSummary,
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
];

export function createThermidorCatalog() {
  return new Catalog(THERMIDOR_CATALOG_ID, thermidorComponents);
}
