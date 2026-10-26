import {Catalog} from '@copilotkit/a2ui-renderer';
import {THERMIDOR_CATALOG_ID} from '@coveo/thermidor-schema/zod3';
import {Breadbox} from '../../../demo-schema-react/src/a2ui/Breadbox/Breadbox.js';
import {BundleDisplay} from '../../../demo-schema-react/src/a2ui/BundleDisplay/BundleDisplay.js';
import {CategoryFacet} from '../../../demo-schema-react/src/a2ui/CategoryFacet/CategoryFacet.js';
import {CommerceSearch} from '../../../demo-schema-react/src/a2ui/CommerceSearch/CommerceSearch.js';
import {createComparisonTable} from '../../../demo-schema-react/src/a2ui/ComparisonTable/ComparisonTable.js';
import {FacetManager} from '../../../demo-schema-react/src/a2ui/FacetManager/FacetManager.js';
import {LayoutStack} from '../../../demo-schema-react/src/a2ui/LayoutStack/LayoutStack.js';
import {NextActionsBar} from '../../../demo-schema-react/src/a2ui/NextActionsBar/NextActionsBar.js';
import {NumericFacet} from '../../../demo-schema-react/src/a2ui/NumericFacet/NumericFacet.js';
import {PageSize} from '../../../demo-schema-react/src/a2ui/PageSize/PageSize.js';
import {Pagination} from '../../../demo-schema-react/src/a2ui/Pagination/Pagination.js';
import {ProductCarousel} from '../../../demo-schema-react/src/a2ui/ProductCarousel/ProductCarousel.js';
import {ProductList} from '../../../demo-schema-react/src/a2ui/ProductList/ProductList.js';
import {createProductResearchCard} from '../../../demo-schema-react/src/a2ui/ProductResearchCard/ProductResearchCard.js';
import {ProductSummary} from '../../../demo-schema-react/src/a2ui/ProductSummary/ProductSummary.js';
import {QuerySummary} from '../../../demo-schema-react/src/a2ui/QuerySummary/QuerySummary.js';
import {RegularFacet} from '../../../demo-schema-react/src/a2ui/RegularFacet/RegularFacet.js';
import {Sort} from '../../../demo-schema-react/src/a2ui/Sort/Sort.js';

/**
 * The renderers for the public `@coveo/thermidor-schema` components the Storefront Preview views
 * use, plus `ProductSummary`, which `BundleDisplay` mounts in its tier slots. Those come straight
 * from `demo-schema-react`.
 *
 * Every surface uses the one public Thermidor catalog: the page's views differ in which of its
 * components they use, not in which catalog they use. The search page's commerce search layout is
 * the one the private `storefront-preview-search` surface allows, plus the `Breadbox` it mounts.
 */
export function createStorefrontCatalog() {
  return new Catalog(THERMIDOR_CATALOG_ID, [
    ProductCarousel,
    NextActionsBar,
    createComparisonTable(),
    BundleDisplay,
    createProductResearchCard(),
    ProductSummary,
    CommerceSearch,
    LayoutStack,
    QuerySummary,
    Sort,
    ProductList,
    Pagination,
    PageSize,
    FacetManager,
    RegularFacet,
    NumericFacet,
    CategoryFacet,
    Breadbox,
  ]);
}
