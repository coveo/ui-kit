import {buildMockCommerceAPIClient} from '../../test/mock-commerce-api-client';
import {PlatformClient} from '../platform-client';
import {CommerceAPIClient} from './commerce-api-client';
import {ProductListingV2Request} from './product-listings/v2/product-listing-v2-request';
import {ProductListingV2} from './product-listings/v2/product-listing-v2-response';
import {SortBy} from '../../features/sort/sort';

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

  describe('getProductListing', () => {
    const buildGetListingV2Request = (
      req: Partial<ProductListingV2Request> = {}
    ): ProductListingV2Request => ({
      accessToken: accessToken,
      organizationId: organizationId,
      url: platformUrl,
      trackingId: trackingId,
      language: req.language ?? '',
      currency: req.currency ?? '',
      clientId: req.clientId ?? '',
      context: req.context ?? {
        view: {url: ''},
      },
    });

    it('should call the platform endpoint with the correct arguments', async () => {
      const request = buildGetListingV2Request();

      mockPlatformCall({
        ok: true,
        json: () => Promise.resolve('some content'),
      });

      await client.getProductListing(request);

      expect(platformCallMock).toBeCalled();
      const mockRequest = platformCallMock.mock.calls[0][0];
      expect(mockRequest).toMatchObject({
        method: 'POST',
        contentType: 'application/json',
        url: `${platformUrl}/rest/organizations/${organizationId}/trackings/${trackingId}/commerce/v2/listing`,
        accessToken: request.accessToken,
        origin: 'commerceApiFetch',
        requestParams: {
          clientId: request.clientId,
          context: request.context,
          language: request.language,
          currency: request.currency,
        },
      });
    });

    it('should return error response on failure', async () => {
      const request = buildGetListingV2Request();

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
      const request = buildGetListingV2Request();

      const expectedBody: ProductListingV2 = {
        products: [],
        facets: [],
        pagination: {page: 0, perPage: 0, totalCount: 0, totalPages: 0},
        responseId: '',
        sort: {
          appliedSort: {sortCriteria: SortBy.Relevance},
          availableSorts: [{sortCriteria: SortBy.Relevance}],
        },
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
});
