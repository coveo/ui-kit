import type {HttpHandler} from 'msw';
import {EndpointHarness, type MockApi, skipOnError} from '../_base.js';
import type {APIErrorWithStatusCode} from '../_common/error.js';
import {
  commerceFacetTransformer,
  createFacetSearchTransformer,
  type FacetSearchResponse,
} from './facet-transformer.js';
import {richResponse as baseListingResponse} from './listing-response.js';
import {commercePaginationTransformer} from './pagination-transformer.js';
import {baseResponse as baseProductSuggestResponse} from './productSuggest-response.js';
import {baseResponse as baseQuerySuggestResponse} from './querySuggest-response.js';
import {baseResponse as baseRecommendationResponse} from './recommendation-response.js';
import {
  richResponse as baseSearchResponse,
  type CommerceSearchResponse,
} from './search-response.js';

const baseFacetSearchResponse: FacetSearchResponse = {
  values: [],
  moreValuesAvailable: false,
};

export class MockCommerceApi implements MockApi {
  readonly searchEndpoint;
  readonly recommendationEndpoint;
  readonly querySuggestEndpoint;
  readonly productSuggestEndpoint;
  readonly productListingEndpoint;
  readonly facetSearchEndpoint;

  constructor(basePath: string = 'https://:orgId.org.coveo.com') {
    this.searchEndpoint = new EndpointHarness<
      CommerceSearchResponse | APIErrorWithStatusCode
    >(
      'POST',
      `${basePath}/rest/organizations/:orgId/commerce/v2/search`,
      baseSearchResponse
    );

    this.recommendationEndpoint = new EndpointHarness(
      'POST',
      `${basePath}/rest/organizations/:orgId/commerce/v2/recommendations`,
      baseRecommendationResponse
    );
    this.querySuggestEndpoint = new EndpointHarness(
      'POST',
      `${basePath}/rest/organizations/:orgId/commerce/v2/search/querySuggest`,
      baseQuerySuggestResponse
    );
    this.productSuggestEndpoint = new EndpointHarness(
      'POST',
      `${basePath}/rest/organizations/:orgId/commerce/v2/search/productSuggest`,
      baseProductSuggestResponse
    );
    this.productListingEndpoint = new EndpointHarness(
      'POST',
      `${basePath}/rest/organizations/:orgId/commerce/v2/listing`,
      baseListingResponse
    );

    this.facetSearchEndpoint = new EndpointHarness<FacetSearchResponse>(
      'POST',
      `${basePath}/rest/organizations/:orgId/commerce/v2/facet`,
      baseFacetSearchResponse
    );
  }

  get handlers(): HttpHandler[] {
    return [
      this.searchEndpoint.generateHandler(),
      this.querySuggestEndpoint.generateHandler(),
      this.productSuggestEndpoint.generateHandler(),
      this.recommendationEndpoint.generateHandler(),
      this.productListingEndpoint.generateHandler(),
      this.facetSearchEndpoint.generateHandler(),
    ];
  }

  clearAll(): void {
    this.searchEndpoint.clear();
    this.recommendationEndpoint.clear();
    this.querySuggestEndpoint.clear();
    this.productSuggestEndpoint.clear();
    this.productListingEndpoint.clear();
    this.facetSearchEndpoint.clear();
  }

  /**
   * Enables interactive facet transformers on search, listing, and facet search endpoints.
   * Call this when stories need to reflect facet selections, pagination, and facet search in responses.
   */
  enableInteractiveFacets(): void {
    const transformer = skipOnError(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (body: unknown, response: any) => {
        let result = commerceFacetTransformer(body, response);
        result = commercePaginationTransformer(body, result);
        return result;
      }
    );
    this.searchEndpoint.withRequestTransformer(transformer);
    this.productListingEndpoint.withRequestTransformer(transformer);
    this.facetSearchEndpoint.withRequestTransformer(
      createFacetSearchTransformer(baseSearchResponse)
    );
  }
}
