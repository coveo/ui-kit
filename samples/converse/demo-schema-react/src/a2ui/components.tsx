import type {ReactComponentImplementation} from '@a2ui/react';
import {Catalog} from '@a2ui/web_core';
import {THERMIDOR_CATALOG_ID} from '@coveo/thermidor-schema/zod3';
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
import {ProgressBlock} from './ProgressBlock/ProgressBlock.js';
import {actsOnSurface} from './surface-controls.js';

export interface ConverseCatalogOptions {
  comparisonTable?: ComparisonTableOptions;
  productResearchCard?: ProductResearchCardOptions;
}

/**
 * The A2-UI protocol version of the messages the catalog renders.
 *
 * @public `demo-multi-surface-react` imports it through a relative path.
 */
export const A2UI_PROTOCOL_VERSION = '1.0';

/** The id of the Converse catalog, which every surface the samples render names. */
export const CONVERSE_CATALOG_ID = 'https://schema.converse.coveo.com/a2-ui/catalog.json';

/**
 * The id the Converse catalog had as the Thermidor catalog. Agent Gateway still sends it during the
 * rollout of {@link CONVERSE_CATALOG_ID}, so {@link withLegacyCatalogId} registers the catalog under
 * both.
 */
export const LEGACY_CATALOG_ID = THERMIDOR_CATALOG_ID;

/**
 * The catalog followed by the same catalog under {@link LEGACY_CATALOG_ID}, for a message
 * processor to render a surface that names either id.
 */
export function withLegacyCatalogId(
  catalog: Catalog<ReactComponentImplementation>
): Catalog<ReactComponentImplementation>[] {
  return [
    catalog,
    new Catalog<ReactComponentImplementation>(LEGACY_CATALOG_ID, catalog.protocolVersion, [
      ...catalog.components.values(),
    ]),
  ];
}

export function createConverseCatalog(
  options: ConverseCatalogOptions = {}
): Catalog<ReactComponentImplementation> {
  return new Catalog<ReactComponentImplementation>(CONVERSE_CATALOG_ID, A2UI_PROTOCOL_VERSION, [
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
    ProgressBlock,
  ]);
}
