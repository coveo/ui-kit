import {Catalog} from '@copilotkit/a2ui-renderer';
import {THERMIDOR_CATALOG_ID} from '@coveo/thermidor-schema/zod3';
import {BundleDisplay} from '../../../demo-schema-react/src/a2ui/BundleDisplay/BundleDisplay.js';
import {ComparisonTable} from '../../../demo-schema-react/src/a2ui/ComparisonTable/ComparisonTable.js';
import {NextActionsBar} from '../../../demo-schema-react/src/a2ui/NextActionsBar/NextActionsBar.js';
import {ProductCarousel} from '../../../demo-schema-react/src/a2ui/ProductCarousel/ProductCarousel.js';
import {ProductResearchCard} from '../../../demo-schema-react/src/a2ui/ProductResearchCard/ProductResearchCard.js';
import {ProductSummary} from '../../../demo-schema-react/src/a2ui/ProductSummary/ProductSummary.js';
import {Cart} from './Cart/Cart.js';
import {QuerySuggestions} from './QuerySuggestions/QuerySuggestions.js';

/**
 * The renderers for the seven public `@coveo/thermidor-schema` components the Storefront Preview
 * areas use, plus `ProductSummary`, which `BundleDisplay` mounts in its tier slots. Those come
 * straight from `demo-schema-react`; `QuerySuggestions` and `Cart` are new.
 *
 * Every surface uses the one Thermidor catalog: the page's areas differ in which of its
 * components they use, not in which catalog they use.
 */
export function createStorefrontCatalog() {
  return new Catalog(THERMIDOR_CATALOG_ID, [
    QuerySuggestions,
    Cart,
    ProductCarousel,
    NextActionsBar,
    ComparisonTable,
    BundleDisplay,
    ProductResearchCard,
    ProductSummary,
  ]);
}
