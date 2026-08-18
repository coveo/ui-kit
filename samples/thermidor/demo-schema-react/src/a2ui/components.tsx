import {
  createCatalog,
  type CatalogDefinitions,
  type CatalogRenderers,
} from '@copilotkit/a2ui-renderer';
import {z} from 'zod';
import {
  ProductListControllerContractSchema,
  NextActionsControllerContractSchema,
  BundleDisplayControllerContractSchema,
  ComparisonTableControllerContractSchema,
} from '@coveo/thermidor-schema';
import {ProductCarouselRenderer} from './ProductCarousel/ProductCarousel.js';
import {NextActionsBarRenderer} from './NextActionsBar/NextActionsBar.js';
import {BundleDisplayRenderer} from './BundleDisplay/BundleDisplay.js';
import {ComparisonTableRenderer} from './ComparisonTable/ComparisonTable.js';

export const THERMIDOR_CATALOG_ID = 'https://schema.thermidor.coveo.com/a2-ui/catalog.json';

export const PRODUCT_LIST_SCHEMA_ID =
  ProductListControllerContractSchema.shape.controllerSchema.value;
export const NEXT_ACTIONS_SCHEMA_ID =
  NextActionsControllerContractSchema.shape.controllerSchema.value;
export const BUNDLE_DISPLAY_SCHEMA_ID =
  BundleDisplayControllerContractSchema.shape.controllerSchema.value;
export const COMPARISON_TABLE_SCHEMA_ID =
  ComparisonTableControllerContractSchema.shape.controllerSchema.value;

export const productCarouselPropsSchema = z.strictObject({
  controllers: z.strictObject({
    productListController: z.strictObject({
      controllerId: z.string(),
      controllerSchema: z.literal(PRODUCT_LIST_SCHEMA_ID),
    }),
  }),
});

export const nextActionsBarPropsSchema = z.strictObject({
  controllers: z.strictObject({
    nextActionsController: z.strictObject({
      controllerId: z.string(),
      controllerSchema: z.literal(NEXT_ACTIONS_SCHEMA_ID),
    }),
  }),
});

export const bundleDisplayPropsSchema = z.strictObject({
  controllers: z.strictObject({
    bundleDisplayController: z.strictObject({
      controllerId: z.string(),
      controllerSchema: z.literal(BUNDLE_DISPLAY_SCHEMA_ID),
    }),
  }),
});

export const comparisonTablePropsSchema = z.strictObject({
  controllers: z.strictObject({
    comparisonTableController: z.strictObject({
      controllerId: z.string(),
      controllerSchema: z.literal(COMPARISON_TABLE_SCHEMA_ID),
    }),
  }),
});

// Zod version mismatch: we use Zod 4 but @copilotkit/a2ui-renderer types are
// built against Zod 3. The ZodObject generics are structurally incompatible at
// the type level even though they are runtime-compatible. These casts will be
// removable once @copilotkit/a2ui-renderer upgrades to Zod 4.
export const thermidorCatalogDefinitions = {
  ProductCarousel: {
    description: 'A responsive product carousel backed by a product-list controller.',
    props: productCarouselPropsSchema,
  },
  NextActionsBar: {
    description: 'Suggested next actions the user can select from.',
    props: nextActionsBarPropsSchema,
  },
  BundleDisplay: {
    description: 'A tiered product bundle display with budget, mid-range, and premium options.',
    props: bundleDisplayPropsSchema,
  },
  ComparisonTable: {
    description: 'A tabular comparison of products across attribute columns.',
    props: comparisonTablePropsSchema,
  },
} as unknown as CatalogDefinitions;

export function createThermidorCatalog() {
  const renderers = {
    ProductCarousel: ProductCarouselRenderer,
    NextActionsBar: NextActionsBarRenderer,
    BundleDisplay: BundleDisplayRenderer,
    ComparisonTable: ComparisonTableRenderer,
  } as unknown as CatalogRenderers<typeof thermidorCatalogDefinitions>;

  return createCatalog(thermidorCatalogDefinitions, renderers, {
    catalogId: THERMIDOR_CATALOG_ID,
    includeBasicCatalog: true,
  });
}
