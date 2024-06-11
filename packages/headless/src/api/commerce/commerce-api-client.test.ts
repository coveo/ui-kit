import {SortBy} from '../../features/sort/sort';
import {buildMockCommerceAPIClient} from '../../test/mock-commerce-api-client';
import {PlatformClient} from '../platform-client';
import {CommerceAPIClient} from './commerce-api-client';
import {CommerceAPIRequest} from './common/request';
import {CommerceResponse} from './common/response';
import {CommerceRecommendationsRequest} from './recommendations/recommendations-request';

describe('commerce api client', () => {
  const platformUrl = 'https://platformdev.cloud.coveo.com';
  const organizationId = 'some-org-id';
  const accessToken = 'some-access-token';
  const trackingId = 'some-tracking-id';

  let client: CommerceAPIClient;
  let platformCallMock: jest.Mock;

  beforeEach(() => {
    client = buildMockCommerceAPIClient();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockPlatformCall = (fakeResponse: unknown) => {
    platformCallMock = jest.fn();

    platformCallMock.mockReturnValue(fakeResponse);
    PlatformClient.call = platformCallMock;
  };

  const buildCommerceAPIRequest = async (
    req: Partial<CommerceAPIRequest> = {}
  ): Promise<CommerceAPIRequest> => ({
    accessToken: accessToken,
    organizationId: organizationId,
    url: platformUrl,
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
    },
  });

  const buildRecommendationsCommerceAPIRequest = async (
    req: Partial<CommerceRecommendationsRequest> = {}
  ): Promise<CommerceRecommendationsRequest> => {
    return {
      slotId: 'slotId',
      accessToken: accessToken,
      organizationId: organizationId,
      url: platformUrl,
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
      },
    };
  };

  it('#getProductListing should call the platform endpoint with the correct arguments', async () => {
    const request = await buildCommerceAPIRequest();

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
      url: `${platformUrl}/rest/organizations/${organizationId}/commerce/v2/listing`,
      accessToken: request.accessToken,
      origin: 'commerceApiFetch',
      requestParams: {
        trackingId: request.trackingId,
        clientId: request.clientId,
        context: request.context,
        language: request.language,
        currency: request.currency,
      },
    });
  });

  it('#search should call the platform endpoint with the correct arguments', async () => {
    const request = {
      ...(await buildCommerceAPIRequest()),
      query: 'some query',
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
      url: `${platformUrl}/rest/organizations/${organizationId}/commerce/v2/search`,
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
    });
  });

  it('#recommendations should call the platform endpoint with the correct arguments', async () => {
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
      url: `${platformUrl}/rest/organizations/${organizationId}/commerce/v2/recommendations`,
      accessToken: request.accessToken,
      origin: 'commerceApiFetch',
      requestParams: {
        trackingId: request.trackingId,
        clientId: request.clientId,
        context: request.context,
        language: request.language,
        currency: request.currency,
      },
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
      url: `${platformUrl}/rest/organizations/${organizationId}/commerce/v2/search/querySuggest`,
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
    });
  });

  it('#facetSearch should call the platform endpoint with the correct arguments', async () => {
    const {accessToken, organizationId, url, ...searchContext} =
      await buildCommerceAPIRequest();
    const request = {
      ...(await buildCommerceAPIRequest()),
      facetId: 'some-facet-id',
      facetQuery: 'some facet query',
      query: 'some query',
      ...searchContext,
    };

    mockPlatformCall({
      ok: true,
      json: () => Promise.resolve('some content'),
    });

    await client.facetSearch(request);

    expect(platformCallMock).toHaveBeenCalled();
    const mockRequest = platformCallMock.mock.calls[0][0];
    expect(mockRequest).toMatchObject({
      method: 'POST',
      contentType: 'application/json',
      url: `${platformUrl}/rest/organizations/${organizationId}/commerce/v2/facet`,
      accessToken: request.accessToken,
      origin: 'commerceApiFetch',
      requestParams: {
        facetId: 'some-facet-id',
        facetQuery: 'some facet query',
        query: 'some query',
        ...searchContext,
      },
    });
  });

  it('should return error response on failure', async () => {
    const request = await buildCommerceAPIRequest();

    const expectedError = {
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
    const request = await buildCommerceAPIRequest();

    const expectedBody: CommerceResponse = {
      products: [],
      facets: [],
      pagination: {page: 0, perPage: 0, totalEntries: 0, totalPages: 0},
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
