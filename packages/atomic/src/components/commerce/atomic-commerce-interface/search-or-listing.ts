import {
  buildProductListing,
  buildSearch,
  type CommerceEngine,
  type ProductListing,
  type Search,
} from '@coveo/headless/commerce';

interface SearchOrListingInterfaceOptions {
  type?: 'search' | 'product-listing';
  enableSpotlightContent?: boolean;
}

/**
 * Whether Headless controllers that execute requests should ask the Commerce API for results
 * (products and Spotlight Content) instead of products only.
 *
 * Every controller that executes a search or listing request must use the same value, otherwise
 * some requests would return products while others would return results.
 */
export function shouldEnableResults(interfaceElement?: SearchOrListingInterfaceOptions): boolean {
  return interfaceElement?.enableSpotlightContent === true;
}

export function buildSearchOrListing(
  engine: CommerceEngine,
  interfaceElement: SearchOrListingInterfaceOptions
): Search | ProductListing {
  const options = {enableResults: shouldEnableResults(interfaceElement)};
  return interfaceElement.type === 'product-listing'
    ? buildProductListing(engine, options)
    : buildSearch(engine, options);
}
