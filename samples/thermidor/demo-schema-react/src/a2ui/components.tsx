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
  PaginationPropsSchema,
  SortPropsSchema,
  SearchBoxPropsSchema,
  RegularFacetPropsSchema,
  NumericFacetPropsSchema,
  CategoryFacetPropsSchema,
  FacetManagerPropsSchema,
  THERMIDOR_CATALOG_ID,
  type FacetManagerProps,
} from '@coveo/thermidor-schema';
export {THERMIDOR_CATALOG_ID};
import {ProductCarouselRenderer} from './ProductCarousel/ProductCarousel.js';
import {NextActionsBarRenderer} from './NextActionsBar/NextActionsBar.js';
import {BundleDisplayRenderer} from './BundleDisplay/BundleDisplay.js';
import {ComparisonTableRenderer} from './ComparisonTable/ComparisonTable.js';
import {ProductListRenderer} from './ProductList/ProductList.js';
import {PaginationRenderer} from './Pagination/Pagination.js';
import {SortRenderer} from './Sort/Sort.js';
import {SearchBoxRenderer} from './SearchBox/SearchBox.js';
import {RegularFacetRenderer} from './RegularFacet/RegularFacet.js';
import {NumericFacetRenderer} from './NumericFacet/NumericFacet.js';
import {CategoryFacetRenderer} from './CategoryFacet/CategoryFacet.js';
import {FacetManagerRenderer, type FacetProps} from './FacetManager/FacetManager.js';

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
    description: 'A tabular comparison of products across attribute columns.',
    props: ComparisonTablePropsSchema,
  },
  ProductList: {
    description: 'A grid of product cards for decomposed commerce search surfaces.',
    props: ProductListPropsSchema,
  },
  Pagination: {
    description: 'Page navigation controls for decomposed commerce search surfaces.',
    props: PaginationPropsSchema,
  },
  Sort: {
    description: 'Sort-order selector for decomposed commerce search surfaces.',
    props: SortPropsSchema,
  },
  SearchBox: {
    description: 'Query input for decomposed commerce search surfaces.',
    props: SearchBoxPropsSchema,
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
});

const EMPTY_CHILD_COMPONENTS = new Map<string, FacetProps>();

function FacetManagerCatalogRenderer({props}: {props: FacetManagerProps}) {
  return <FacetManagerRenderer props={props} childComponents={EMPTY_CHILD_COMPONENTS} />;
}

export function createThermidorCatalog() {
  const renderers = asCatalogRenderers({
    ProductCarousel: ProductCarouselRenderer,
    NextActionsBar: NextActionsBarRenderer,
    BundleDisplay: BundleDisplayRenderer,
    ComparisonTable: ComparisonTableRenderer,
    ProductList: ProductListRenderer,
    Pagination: PaginationRenderer,
    Sort: SortRenderer,
    SearchBox: SearchBoxRenderer,
    RegularFacet: RegularFacetRenderer,
    NumericFacet: NumericFacetRenderer,
    CategoryFacet: CategoryFacetRenderer,
    FacetManager: FacetManagerCatalogRenderer,
  });

  return createCatalog(thermidorCatalogDefinitions, renderers, {
    catalogId: THERMIDOR_CATALOG_ID,
    includeBasicCatalog: true,
  });
}
