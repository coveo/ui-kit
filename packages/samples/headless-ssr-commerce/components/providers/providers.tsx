'use client';

import {
  listingEngineDefinition,
  recommendationEngineDefinition,
  searchEngineDefinition,
  standaloneEngineDefinition,
} from '@/lib/commerce-engine';
import {buildProviderWithDefinition} from '@coveo/headless-react/ssr-commerce';

export const ListingProvider = buildProviderWithDefinition(
  listingEngineDefinition
);

export const SearchProvider = buildProviderWithDefinition(
  searchEngineDefinition
);

export const RecommendationProvider = buildProviderWithDefinition(
  recommendationEngineDefinition
);

export const StandaloneProvider = buildProviderWithDefinition(
  standaloneEngineDefinition
);
