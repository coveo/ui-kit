import {THERMIDOR_CATALOG_ID} from '@coveo/thermidor-schema/zod3';

// PROTOTYPE (KIT-6367): stands in for what the schema would export. The contract declares the
// search box surface, with fixed ids and composition, so the session creates it at construction
// and the page draws it on first paint. `fetchSuggestions` is marked as a lookup.

export const SEARCH_BOX_SURFACE_ID = 'search-box';

const ROOT_ID = 'root';

export const SEARCH_BOX_SURFACE = {
  version: 'v1.0',
  createSurface: {
    surfaceId: SEARCH_BOX_SURFACE_ID,
    catalogId: THERMIDOR_CATALOG_ID,
    components: [
      {
        id: ROOT_ID,
        component: 'QuerySuggestions',
        query: {path: `/state/${ROOT_ID}/query`},
        completions: {path: `/state/${ROOT_ID}/completions`},
        products: {path: `/state/${ROOT_ID}/products`},
      },
    ],
    dataModel: {[`/state/${ROOT_ID}`]: {query: '', completions: [], products: []}},
  },
};

export const LOOKUP_ACTIONS = ['fetchSuggestions'];
