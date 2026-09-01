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
  THERMIDOR_CATALOG_ID,
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
});

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
  });

  return createCatalog(thermidorCatalogDefinitions, renderers, {
    catalogId: THERMIDOR_CATALOG_ID,
    includeBasicCatalog: true,
  });
}
