import {
  createCatalog,
  type CatalogDefinitions,
  type CatalogRenderers,
} from '@copilotkit/a2ui-renderer';
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
import {toBinderProps} from './catalog-props-migration.js';
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
 * The single Zod-3-vs-Zod-4 shim at the catalog boundary.
 *
 * The frozen renderer's binder (`@a2ui/web_core@0.9.0`) resolves `{ "path": ... }` bindings by
 * introspecting each prop schema's **Zod 3** runtime internals. The generated `XxxPropsSchema`
 * (`@coveo/thermidor-schema`) are **Zod 4**, whose internals the binder cannot read — so every
 * field would be classified STATIC and a binding would leak to the renderer unresolved.
 *
 * This function is the ONE place the whole workaround lives:
 *   - RUNTIME: it rebuilds each definition's `props` through {@link toBinderProps}, producing a
 *     real Zod 3 `ZodObject` whose fields are the A2-UI Dynamic_Value unions the binder classifies
 *     as DYNAMIC (bindable props) or plain Zod 3 static string/array child-refs it passes through
 *     untouched (composition props). Callers therefore pass the RAW generated `XxxPropsSchema`.
 *   - TYPES: it reconciles the two Zod packages' `ZodObject` type identities into the renderer's
 *     `CatalogDefinitions` (a cast the runtime rebuild alone cannot express to the compiler).
 *
 * @deprecated Remove this function (and {@link toBinderProps}) and pass each `XxxPropsSchema`
 * directly to `createCatalog` once `@copilotkit/a2ui-renderer` upgrades its binder to Zod 4.
 */
function asCatalogDefinitions<
  T extends Record<string, {description?: string; props: {shape: Record<string, unknown>}}>,
>(definitions: T): CatalogDefinitions {
  const migrated: Record<string, {description?: string; props: unknown}> = {};
  for (const [name, definition] of Object.entries(definitions)) {
    migrated[name] = {...definition, props: toBinderProps(definition.props)};
  }
  return migrated as unknown as CatalogDefinitions;
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
    description: 'A responsive product carousel rendered from its resolved product-list state.',
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
    description: 'A multi-select facet rendered from its resolved regular-facet state.',
    props: RegularFacetPropsSchema,
  },
  NumericFacet: {
    description: 'A numeric-range facet rendered from its resolved numeric-facet state.',
    props: NumericFacetPropsSchema,
  },
  CategoryFacet: {
    description: 'A hierarchical category facet rendered from its resolved category-facet state.',
    props: CategoryFacetPropsSchema,
  },
  FacetManager: {
    description: 'Orders and renders sidebar facets for a commerce search surface.',
    props: FacetManagerPropsSchema,
  },
  CommerceSearch: {
    description:
      'Root of a decomposed commerce search surface; mounts its named sidebar/main slots.',
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
    description: 'A "Products per page" selector rendered from its resolved page-size state.',
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
