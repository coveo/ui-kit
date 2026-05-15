export interface CoveoSearchEndpointRequest {
  /**
   * The basic query expression (user's search query)
   */
  q?: string;

  /**
   * Advanced query expression (filters, facets, etc.)
   */
  aq?: string;

  /**
   * Constant query expression (always applied)
   */
  cq?: string;

  /**
   * Number of results to return per page
   */
  numberOfResults?: number;

  /**
   * Index of the first result to return (0-based)
   * For page-based pagination: firstResult = (page - 1) * numberOfResults
   */
  firstResult?: number;

  /**
   * Fields to include in results
   */
  fieldsToInclude?: string[];

  /**
   * Enable query suggestions
   */
  enableDidYouMean?: boolean;

  /**
   * Include facets in response
   */
  facets?: CoveoFacetRequest[];
}

/**
 * Facet request definition
 */
export interface CoveoFacetRequest {
  /**
   * Unique identifier for the facet
   */
  facetId: string;

  /**
   * Field to facet on
   */
  field: string;

  /**
   * Type of facet
   */
  type?: 'specific' | 'date' | 'numeric';

  /**
   * Number of facet values to return
   */
  numberOfValues?: number;

  /**
   * Injected current filter selections
   */
  currentValues?: Array<{value: string; state: 'selected' | 'idle'}>;
}

/**
 * Coveo Search API Response
 */
export interface CoveoSearchEndpointResponse {
  /**
   * Total number of results matching the query
   */
  totalCount: number;

  /**
   * Array of search results
   */
  results: CoveoSearchResult[];

  /**
   * Facets with counts and values
   */
  facets?: CoveoFacetResponse[];

  /**
   * Duration of the query execution in milliseconds
   */
  duration?: number;

  /**
   * Query suggestions (Did You Mean)
   */
  queryCorrections?: Array<{
    correctedQuery: string;
    wordCorrections: unknown[];
  }>;
}

/**
 * Individual search result from Coveo
 */
export interface CoveoSearchResult {
  /**
   * Unique result identifier
   */
  uniqueId: string;

  /**
   * Result title
   */
  title: string;

  /**
   * Clickable URI for the result
   */
  uri: string;

  /**
   * Result excerpt/summary
   */
  excerpt?: string;

  /**
   * Printable URI (user-friendly URL)
   */
  printableUri?: string;

  /**
   * Click URI (for analytics tracking)
   */
  clickUri?: string;

  /**
   * Raw field values from the index
   */
  raw?: Record<string, unknown>;

  /**
   * Ranking score
   */
  score?: number;
}

/**
 * Facet response from Coveo
 */
export interface CoveoFacetResponse {
  /**
   * Facet identifier
   */
  facetId: string;

  /**
   * Field name
   */
  field: string;

  /**
   * Facet values with counts
   */
  values: CoveoFacetValue[];
}

/**
 * Individual facet value with count
 */
export interface CoveoFacetValue {
  /**
   * The facet value
   */
  value: string;

  /**
   * Number of results with this value
   */
  numberOfResults: number;

  /**
   * Current state of the value (selected or not)
   */
  state?: 'selected' | 'idle';
}

export type CoveoSearchEndpointRequestMiddleware = (
  request: CoveoSearchEndpointRequest
) => CoveoSearchEndpointRequest;

export type CoveoSearchEndpointResponseListener = (
  response: Readonly<CoveoSearchEndpointResponse>
) => void;

export type SearchEndpointClientResult =
  | {
      success: true;
      data?: CoveoSearchEndpointResponse;
    }
  | {
      success: false;
      error: string;
    };

export interface SearchEndpointClient {
  call: (
    request: CoveoSearchEndpointRequest
  ) => Promise<SearchEndpointClientResult>;
}
