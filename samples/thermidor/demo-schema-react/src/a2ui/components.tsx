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
  THERMIDOR_CATALOG_ID,
} from '@coveo/thermidor-schema';
export {THERMIDOR_CATALOG_ID};
import {ProductCarouselRenderer} from './ProductCarousel/ProductCarousel.js';
import {NextActionsBarRenderer} from './NextActionsBar/NextActionsBar.js';
import {BundleDisplayRenderer} from './BundleDisplay/BundleDisplay.js';
import {ComparisonTableRenderer} from './ComparisonTable/ComparisonTable.js';

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
});

export function createThermidorCatalog() {
  const renderers = asCatalogRenderers({
    ProductCarousel: ProductCarouselRenderer,
    NextActionsBar: NextActionsBarRenderer,
    BundleDisplay: BundleDisplayRenderer,
    ComparisonTable: ComparisonTableRenderer,
  });

  return createCatalog(thermidorCatalogDefinitions, renderers, {
    catalogId: THERMIDOR_CATALOG_ID,
    includeBasicCatalog: true,
  });
}
