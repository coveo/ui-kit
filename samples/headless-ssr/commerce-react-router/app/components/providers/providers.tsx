import {buildProviderWithDefinition} from '@coveo/headless-react/ssr-commerce';
import {
  _listingEngineDefinition,
  _recommendationEngineDefinition,
  _searchEngineDefinition,
  _standaloneEngineDefinition,
} from '@/lib/commerce-engine';

// Wraps listing pages to provide context for listing-specific hooks
export const ListingProvider = buildProviderWithDefinition(
  _listingEngineDefinition
);

// Wraps search pages to provide context for search-specific hooks
export const SearchProvider = buildProviderWithDefinition(
  _searchEngineDefinition
);

// Wraps recommendations, whether in a standalone, search, or listing page
export const RecommendationProvider = buildProviderWithDefinition(
  _recommendationEngineDefinition
);

// Used for components that don’t require triggering a search or product fetch (for example, cart pages, standalone search box)
export const StandaloneProvider = buildProviderWithDefinition(
  _standaloneEngineDefinition
);
