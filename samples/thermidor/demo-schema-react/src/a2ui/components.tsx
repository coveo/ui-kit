import {
  createCatalog,
  type CatalogDefinitions,
  type CatalogRenderers,
} from '@copilotkit/a2ui-renderer';
import type {z} from 'zod';
import {
  ProductCarouselPropsSchema,
  NextActionsBarPropsSchema,
  BundleDisplayPropsSchema,
  ComparisonTablePropsSchema,
  ProductListPropsSchema,
  ProductSummaryPropsSchema,
  PaginationPropsSchema,
  SortPropsSchema,
  RegularFacetPropsSchema,
  NumericFacetPropsSchema,
  CategoryFacetPropsSchema,
  FacetManagerPropsSchema,
  CommerceSearchPropsSchema,
  LayoutStackPropsSchema,
  QuerySummaryPropsSchema,
  PageSizePropsSchema,
  THERMIDOR_CATALOG_ID,
} from '@coveo/thermidor-schema';
export {THERMIDOR_CATALOG_ID};
import {ProductCarouselRenderer} from './ProductCarousel/ProductCarousel.js';
import {NextActionsBarRenderer} from './NextActionsBar/NextActionsBar.js';
import {BundleDisplayRenderer} from './BundleDisplay/BundleDisplay.js';
import {ComparisonTableRenderer} from './ComparisonTable/ComparisonTable.js';
import {ProductListRenderer} from './ProductList/ProductList.js';
import {ProductSummaryRenderer} from './ProductSummary/ProductSummary.js';
import {PaginationRenderer} from './Pagination/Pagination.js';
import {SortRenderer} from './Sort/Sort.js';
import {RegularFacetRenderer} from './RegularFacet/RegularFacet.js';
import {NumericFacetRenderer} from './NumericFacet/NumericFacet.js';
import {CategoryFacetRenderer} from './CategoryFacet/CategoryFacet.js';
import {FacetManagerRenderer} from './FacetManager/FacetManager.js';
import {CommerceSearchRenderer} from './CommerceSearch/CommerceSearch.js';
import {LayoutStackRenderer} from './LayoutStack/LayoutStack.js';
import {QuerySummaryRenderer} from './QuerySummary/QuerySummary.js';
import {PageSizeRenderer} from './PageSize/PageSize.js';

/**
 * Converts Zod 4 catalog definitions to the Zod 3 CatalogDefinitions type
 * expected by @copilotkit/a2ui-renderer. Validates structure at compile time.
 *
 * @deprecated Remove when @copilotkit/a2ui-renderer upgrades to Zod 4.
 */
function asCatalogDefinitions<
  T extends Record<string, {description?: string; props: z.ZodObject<any>}>,
>(definitions: T): CatalogDefinitions {
  return definitions as unknown as CatalogDefinitions;
}

/**
 * Converts Zod 4 catalog renderers to the Zod 3 CatalogRenderers type
 * expected by @copilotkit/a2ui-renderer. Validates structure at compile time.
 *
 * @deprecated Remove when @copilotkit/a2ui-renderer upgrades to Zod 4.
 */
function asCatalogRenderers<T extends Record<string, React.FC<any>>>(
  renderers: T
): CatalogRenderers<CatalogDefinitions> {
  return renderers as unknown as CatalogRenderers<CatalogDefinitions>;
}

export const thermidorCatalogDefinitions = asCatalogDefinitions({
  ProductCarousel: {
    description: 'A responsive product carousel backed by a product-list controller.',
    props: ProductCarouselPropsSchema,
  },
  NextActionsBar: {
    description: 'Suggested next actions the user can select from.',
    props: NextActionsBarPropsSchema,
  },
  BundleDisplay: {
    description: 'A tiered product bundle display with budget, mid-range, and premium options.',
    props: BundleDisplayPropsSchema,
  },
  ComparisonTable: {
    description: 'A tabular comparison of products across attribute rows.',
    props: ComparisonTablePropsSchema,
  },
  ProductList: {
    description: 'A grid of product cards for decomposed commerce search surfaces.',
    props: ProductListPropsSchema,
  },
  ProductSummary: {
    description: 'A compact single-product summary row for a bundle category slot.',
    props: ProductSummaryPropsSchema,
  },
  Pagination: {
    description: 'Page navigation controls for decomposed commerce search surfaces.',
    props: PaginationPropsSchema,
  },
  Sort: {
    description: 'Sort-order selector for decomposed commerce search surfaces.',
    props: SortPropsSchema,
  },
  RegularFacet: {
    description: 'A multi-select facet backed by a regular-facet controller.',
    props: RegularFacetPropsSchema,
  },
  NumericFacet: {
    description: 'A numeric-range facet backed by a numeric-facet controller.',
    props: NumericFacetPropsSchema,
  },
  CategoryFacet: {
    description: 'A hierarchical category facet backed by a category-facet controller.',
    props: CategoryFacetPropsSchema,
  },
  FacetManager: {
    description: 'Orders and renders sidebar facets for a commerce search surface.',
    props: FacetManagerPropsSchema,
  },
  CommerceSearch: {
    description: 'Root of a decomposed commerce search surface; mounts its children by id.',
    props: CommerceSearchPropsSchema,
  },
  LayoutStack: {
    description:
      'Generic layout container; stacks its children in a column or row from the composition plane.',
    props: LayoutStackPropsSchema,
  },
  QuerySummary: {
    description: 'Summarizes the current result window (e.g. "Products 1-12 of 43 for ...").',
    props: QuerySummaryPropsSchema,
  },
  PageSize: {
    description: 'A "Products per page" selector backed by its own page-size controller.',
    props: PageSizePropsSchema,
  },
});

const thermidorCatalogRenderers = asCatalogRenderers({
  ProductCarousel: ProductCarouselRenderer,
  NextActionsBar: NextActionsBarRenderer,
  BundleDisplay: BundleDisplayRenderer,
  ComparisonTable: ComparisonTableRenderer,
  ProductList: ProductListRenderer,
  ProductSummary: ProductSummaryRenderer,
  Pagination: PaginationRenderer,
  Sort: SortRenderer,
  RegularFacet: RegularFacetRenderer,
  NumericFacet: NumericFacetRenderer,
  CategoryFacet: CategoryFacetRenderer,
  FacetManager: FacetManagerRenderer,
  CommerceSearch: CommerceSearchRenderer,
  LayoutStack: LayoutStackRenderer,
  QuerySummary: QuerySummaryRenderer,
  PageSize: PageSizeRenderer,
});

export function createThermidorCatalog() {
  return createCatalog(thermidorCatalogDefinitions, thermidorCatalogRenderers, {
    catalogId: THERMIDOR_CATALOG_ID,
    includeBasicCatalog: true,
  });
}
