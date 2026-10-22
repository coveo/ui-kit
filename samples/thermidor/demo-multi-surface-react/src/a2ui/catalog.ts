import {Catalog} from '@copilotkit/a2ui-renderer';
import {THERMIDOR_CATALOG_ID} from '@coveo/thermidor-schema/zod3';
import {BundleDisplay} from '../../../demo-schema-react/src/a2ui/BundleDisplay/BundleDisplay.js';
import {ComparisonTable} from '../../../demo-schema-react/src/a2ui/ComparisonTable/ComparisonTable.js';
import {NextActionsBar} from '../../../demo-schema-react/src/a2ui/NextActionsBar/NextActionsBar.js';
import {ProductCarousel} from '../../../demo-schema-react/src/a2ui/ProductCarousel/ProductCarousel.js';
import {createProductResearchCard} from '../../../demo-schema-react/src/a2ui/ProductResearchCard/ProductResearchCard.js';
import {ProductSummary} from '../../../demo-schema-react/src/a2ui/ProductSummary/ProductSummary.js';
import {QuerySuggestions} from './QuerySuggestions/QuerySuggestions.js';

/**
 * The renderers for the public `@coveo/thermidor-schema` components the Storefront Preview views
 * use, plus `ProductSummary`, which `BundleDisplay` mounts in its tier slots. Those come straight
 * from `demo-schema-react`; `QuerySuggestions` is new.
 *
 * Every surface uses the one public Thermidor catalog: the page's views differ in which of its
 * components they use, not in which catalog they use.
 */
export function createStorefrontCatalog() {
  return new Catalog(THERMIDOR_CATALOG_ID, [
    QuerySuggestions,
    ProductCarousel,
    NextActionsBar,
    ComparisonTable,
    BundleDisplay,
    createProductResearchCard(),
    ProductSummary,
  ]);
}
