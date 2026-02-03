import type {Mock} from 'vitest';
import {SortBy} from '../../features/sort/sort.js';
import {buildMockCommerceAPIClient} from '../../test/mock-commerce-api-client.js';
import {VERSION} from '../../utils/version.js';
import {PlatformClient} from '../platform-client.js';
import {
  type CommerceAPIClient,
  getCommerceApiBaseUrl,
  getCommerceRedirectApiBaseUrl,
} from './commerce-api-client.js';
import type {CommerceAPIErrorStatusResponse} from './commerce-api-error-response.js';
import type {FilterableCommerceAPIRequest} from './common/request.js';
import type {CommerceListingRequest} from './listing/request.js';
import type {ListingCommerceSuccessResponse} from './listing/response.js';
import type {CommerceRecommendationsRequest} from './recommendations/recommendations-request.js';
import type {CommerceSearchRedirectRequest} from './search/redirect-request.js';

describe('commerce api client', () => {
  const organizationId = 'organization';
  const apiBaseUrl = getCommerceApiBaseUrl(organizationId);
  const accessToken = 'some-access-token';
  const trackingId = 'some-tracking-id';

  let client: CommerceAPIClient;
  let platformCallMock: Mock;

  beforeEach(() => {
    client = buildMockCommerceAPIClient();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockPlatformCall = (fakeResponse: unknown) => {
    platformCallMock = vi.fn();

    platformCallMock.mockReturnValue(fakeResponse);
    PlatformClient.call = platformCallMock;
  };

  const buildCommerceAPIRequest = async (
    req: Partial<FilterableCommerceAPIRequest> = {}
  ): Promise<FilterableCommerceAPIRequest> => ({
    accessToken: accessToken,
    organizationId: organizationId,
    url: apiBaseUrl,
    trackingId: trackingId,
    language: req.language ?? '',
    country: req.country ?? '',
    currency: req.currency ?? '',
    clientId: req.clientId ?? '',
    context: req.context ?? {
      view: {
        url: '',
        referrer: 'https://example.org/referrer',
      },
      capture: true,
      source: [`@coveo/headless@${VERSION}`],
      custom: {
        stringKey: 'value',
        numberKey: 123,
      },
    },
  });

  const buildCommerceRedirectAPIRequest = async (
    req: Partial<CommerceSearchRedirectRequest> = {}
  ): Promise<CommerceSearchRedirectRequest> => ({
    accessToken: accessToken,
    organizationId: organizationId,
    url: apiBaseUrl,
    trackingId: trackingId,
    language: req.language ?? '',
    country: req.country ?? '',
    currency: req.currency ?? '',
    clientId: req.clientId ?? '',
    context: req.context ?? {
      view: {
        url: '',
        referrer: 'https://example.org/referrer',
      },
      capture: true,
      source: [`@coveo/headless@${VERSION}`],
    },
    query: req.query,
    debug: req.debug ?? false,
    refreshCache: req.refreshCache ?? false,
  });

  const buildRecommendationsCommerceAPIRequest = async (
    req: Partial<CommerceRecommendationsRequest> = {}
  ): Promise<CommerceRecommendationsRequest> => {
    return {
      slotId: 'slotId',
      accessToken: accessToken,
      organizationId: organizationId,
      url: apiBaseUrl,
      trackingId: trackingId,
      language: req.language ?? '',
      country: req.country ?? '',
      currency: req.currency ?? '',
      clientId: req.clientId ?? '',
      context: req.context ?? {
        view: {
          url: '',
          referrer: 'https://example.org/referrer',
        },
        capture: true,
        source: [`@coveo/headless@${VERSION}`],
        custom: {
          stringKey: 'value',
          numberKey: 123,
        },
      },
    };
  };

  it('#getProductListing should call the platform endpoint with the correct arguments', async () => {
    const request: CommerceListingRequest = {
      ...(await buildCommerceAPIRequest()),
      enableResults: true,
    };

    mockPlatformCall({
      ok: true,
      json: () => Promise.resolve('some content'),
    });

    await client.getProductListing(request);

    expect(platformCallMock).toHaveBeenCalled();
    const mockRequest = platformCallMock.mock.calls[0][0];
    expect(mockRequest).toMatchObject({
      method: 'POST',
      contentType: 'application/json',
      url: `${getCommerceApiBaseUrl(organizationId)}/listing`,
      accessToken: request.accessToken,
      origin: 'commerceApiFetch',
      requestParams: {
        trackingId: request.trackingId,
        clientId: request.clientId,
        context: request.context,
        language: request.language,
        currency: request.currency,
        enableResults: request.enableResults,
      },
      requestMetadata: {method: 'listing'},
    });
  });

  it('#search should call the platform endpoint with the correct arguments', async () => {
    const request = {
      ...(await buildCommerceAPIRequest()),
      query: 'some query',
      enableResults: true,
    };

    mockPlatformCall({
      ok: true,
      json: () => Promise.resolve('some content'),
    });

    await client.search(request);

    expect(platformCallMock).toHaveBeenCalled();
    const mockRequest = platformCallMock.mock.calls[0][0];
    expect(mockRequest).toMatchObject({
      method: 'POST',
      contentType: 'application/json',
      url: `${getCommerceApiBaseUrl(organizationId)}/search`,
      accessToken: request.accessToken,
      origin: 'commerceApiFetch',
      requestParams: {
        query: 'some query',
        enableResults: request.enableResults,
        trackingId: request.trackingId,
        clientId: request.clientId,
        context: request.context,
        language: request.language,
        currency: request.currency,
      },
      requestMetadata: {method: 'search'},
    });
  });

  it('#searchRedirect should call the platform endpoint with the correct redirect URL', async () => {
    const request = {
      ...(await buildCommerceRedirectAPIRequest()),
      query: 'some query',
    };

    mockPlatformCall({
      ok: true,
      json: () => Promise.resolve('some content'),
    });

    await client.searchRedirect(request);

    expect(platformCallMock).toHaveBeenCalled();
    const mockRequest = platformCallMock.mock.calls[0][0];
    expect(mockRequest).toMatchObject({
      method: 'POST',
      contentType: 'application/json',
      url: `https://${organizationId}.org.coveo.com/api/v2/organizations/${organizationId}/commerce/search/redirect`,
      accessToken: request.accessToken,
      origin: 'commerceApiFetch',
      requestParams: {
        query: 'some query',
        debug: false,
        refreshCache: false,
        trackingId: request.trackingId,
        clientId: request.clientId,
        context: request.context,
        language: request.language,
        currency: request.currency,
        country: request.country,
      },
      requestMetadata: {method: 'search/redirect'},
    });
  });

  it('#getRecommendations should call the platform endpoint with the correct arguments', async () => {
    const request = await buildRecommendationsCommerceAPIRequest();

    mockPlatformCall({
      ok: true,
      json: () => Promise.resolve('some content'),
    });

    await client.getRecommendations(request);

    expect(platformCallMock).toHaveBeenCalled();
    const mockRequest = platformCallMock.mock.calls[0][0];
    expect(mockRequest).toMatchObject({
      method: 'POST',
      contentType: 'application/json',
      url: `${getCommerceApiBaseUrl(organizationId)}/recommendations`,
      accessToken: request.accessToken,
      origin: 'commerceApiFetch',
      requestParams: {
        trackingId: request.trackingId,
        clientId: request.clientId,
        context: request.context,
        language: request.language,
        currency: request.currency,
      },
      requestMetadata: {method: 'recommendations'},
    });
  });

  it('#productSuggestions should call the platform endpoint with the correct arguments', async () => {
    const request = {
      ...(await buildCommerceAPIRequest()),
      query: 'some query',
    };

    mockPlatformCall({
      ok: true,
      json: () => Promise.resolve('some content'),
    });

    await client.productSuggestions(request);

    expect(platformCallMock).toHaveBeenCalled();
    const mockRequest = platformCallMock.mock.calls[0][0];
    expect(mockRequest).toMatchObject({
      method: 'POST',
      contentType: 'application/json',
      url: `${getCommerceApiBaseUrl(organizationId)}/search/productSuggest`,
      accessToken: request.accessToken,
      origin: 'commerceApiFetch',
      requestParams: {
        query: 'some query',
        trackingId: request.trackingId,
        clientId: request.clientId,
        context: request.context,
        language: request.language,
        currency: request.currency,
      },
      requestMetadata: {method: 'search/productSuggest'},
    });
  });

  it('#querySuggest should call the platform endpoint with the correct arguments', async () => {
    const request = {
      ...(await buildCommerceAPIRequest()),
      query: 'some query',
    };

    mockPlatformCall({
      ok: true,
      json: () => Promise.resolve('some content'),
    });

    await client.querySuggest(request);

    expect(platformCallMock).toHaveBeenCalled();
    const mockRequest = platformCallMock.mock.calls[0][0];
    expect(mockRequest).toMatchObject({
      method: 'POST',
      contentType: 'application/json',
      url: `${getCommerceApiBaseUrl(organizationId)}/search/querySuggest`,
      accessToken: request.accessToken,
      origin: 'commerceApiFetch',
      requestParams: {
        query: 'some query',
        trackingId: request.trackingId,
        clientId: request.clientId,
        context: request.context,
        language: request.language,
        currency: request.currency,
      },
      requestMetadata: {method: 'search/querySuggest'},
    });
  });

  it('#facetSearch should call the platform endpoint with the correct arguments', async () => {
    const {
      accessToken: _accessToken,
      organizationId,
      url: _url,
      ...searchContext
    } = await buildCommerceAPIRequest();
    const request = {
      ...(await buildCommerceAPIRequest()),
      facetId: 'some-facet-id',
      facetQuery: 'some facet query',
      query: 'some query',
      numberOfValues: 5,
      ...searchContext,
    };

    mockPlatformCall({
      ok: true,
      json: () => Promise.resolve('some content'),
    });

    await client.facetSearch(request, 'SEARCH');

    expect(platformCallMock).toHaveBeenCalled();
    const mockRequest = platformCallMock.mock.calls[0][0];
    expect(mockRequest).toMatchObject({
      method: 'POST',
      contentType: 'application/json',
      url: `${getCommerceApiBaseUrl(organizationId)}/facet?type=SEARCH`,
      accessToken: request.accessToken,
      origin: 'commerceApiFetch',
      requestParams: {
        facetId: 'some-facet-id',
        facetQuery: 'some facet query',
        query: 'some query',
        ...searchContext,
      },
      requestMetadata: {method: 'facet'},
    });
  });

  it('#getBadges should call the platform endpoint with the correct arguments', async () => {
    const request = {
      ...(await buildCommerceAPIRequest()),
      placementIds: ['placement1', 'placement2'],
    };

    mockPlatformCall({
      ok: true,
      json: () => Promise.resolve('some content'),
    });

    await client.getBadges(request);

    expect(platformCallMock).toHaveBeenCalled();
    const mockRequest = platformCallMock.mock.calls[0][0];
    expect(mockRequest).toMatchObject({
      method: 'POST',
      contentType: 'application/json',
      url: `${getCommerceApiBaseUrl(organizationId)}/tracking-ids/${trackingId}/badges`,
      accessToken: request.accessToken,
      origin: 'commerceApiFetch',
      requestParams: {
        placementIds: ['placement1', 'placement2'],
        context: request.context,
        language: request.language,
        country: request.country,
        currency: request.currency,
      },
      requestMetadata: {method: 'badges'},
    });
  });

  it('should return error response on failure', async () => {
    const request: CommerceListingRequest = {
      ...(await buildCommerceAPIRequest()),
      enableResults: false,
    };

    const expectedError: CommerceAPIErrorStatusResponse = {
      statusCode: 401,
      message: 'Unauthorized',
      type: 'authorization',
    };

    mockPlatformCall({
      ok: false,
      json: () => Promise.resolve(expectedError),
    });

    const response = await client.getProductListing(request);

    expect(response).toMatchObject({
      error: expectedError,
    });
  });

  it('should return success response on success', async () => {
    const request: CommerceListingRequest = {
      ...(await buildCommerceAPIRequest()),
      enableResults: false,
    };

    const expectedBody: ListingCommerceSuccessResponse = {
      products: [],
      results: [],
      facets: [],
      pagination: {
        page: 0,
        perPage: 0,
        totalEntries: 0,
        totalPages: 0,
        totalProducts: 0,
        totalSpotlights: 0,
      },
      responseId: '',
      sort: {
        appliedSort: {sortCriteria: SortBy.Relevance},
        availableSorts: [{sortCriteria: SortBy.Relevance}],
      },
      triggers: [],
    };

    mockPlatformCall({
      ok: true,
      json: () => Promise.resolve(expectedBody),
    });

    const response = await client.getProductListing(request);

    expect(response).toMatchObject({
      success: expectedBody,
    });
  });
});

describe('getCommerceRedirectApiBaseUrl', () => {
  it('should return the correct redirect API URL for prod environment', () => {
    const organizationId = 'testorg';
    const result = getCommerceRedirectApiBaseUrl(organizationId);
    expect(result).toBe(
      'https://testorg.org.coveo.com/api/v2/organizations/testorg/commerce/search/redirect'
    );
  });

  it('should return the correct redirect API URL for dev environment', () => {
    const organizationId = 'testorg';
    const result = getCommerceRedirectApiBaseUrl(organizationId, 'dev');
    expect(result).toBe(
      'https://testorg.orgdev.coveo.com/api/v2/organizations/testorg/commerce/search/redirect'
    );
  });
});
