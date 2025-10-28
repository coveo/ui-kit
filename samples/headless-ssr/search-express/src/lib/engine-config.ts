import {
  defineQuerySummary,
  defineResultList,
  defineSearchBox,
  getSampleSearchEngineConfiguration,
} from '@coveo/headless/ssr-next';

export const engineConfig = {
  // Using sample config for demo - replace with your organization's settings
  configuration: getSampleSearchEngineConfiguration(),

  // Search controllers - each manages a specific UI component
  controllers: {
    // Search box controller - handles query input and submission
    searchBox: defineSearchBox(),

    // Query summary controller - displays result count and query info
    summary: defineQuerySummary(),

    // Result list controller - manages search results display and pagination
    resultList: defineResultList(),

    // To add more controllers, uncomment and configure:
    // facets: defineFacetManager(),          // Faceted search
    // sort: defineSort(),                    // Result sorting
    // pager: definePager(),                  // Pagination controls
    // breadcrumbManager: defineBreadcrumbManager(), // Search refinement breadcrumbs
  },
};
