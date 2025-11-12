'use client';

import {buildProviderWithDefinition} from '@coveo/headless-react/ssr-commerce-next';
import {
  listingEngineDefinition,
  recommendationEngineDefinition,
  searchEngineDefinition,
  standaloneEngineDefinition,
} from '@/lib/commerce-engine';

// Wraps listing pages to provide context for listing-specific hooks
export const ListingProvider = buildProviderWithDefinition(
  listingEngineDefinition
);

// Wraps search pages to provide context for search-specific hooks
export const SearchProvider = buildProviderWithDefinition(
  searchEngineDefinition
);

// Wraps recommendations, whether in a standalone, search, or listing page
export const RecommendationProvider = buildProviderWithDefinition(
  recommendationEngineDefinition
);

// Used for components that don’t require triggering a search or product fetch (for example, cart pages, standalone search box)
export const StandaloneProvider = buildProviderWithDefinition(
  standaloneEngineDefinition
);
