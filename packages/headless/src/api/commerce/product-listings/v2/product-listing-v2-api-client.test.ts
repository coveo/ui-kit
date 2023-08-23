import {SortBy} from '../../../../product-listing.index';
import {buildMockProductListingV2APIClient} from '../../../../test/mock-product-listing-v2-api-client';
import {PlatformClient} from '../../../platform-client';
import {ProductListingV2APIClient} from './product-listing-v2-api-client';
import {Mode} from './product-listing-v2-params';
import {
  ProductListingV2SuccessResponse,
  ProductListingV2Request,
} from './product-listing-v2-request';

describe('product listing api client', () => {
  const platformUrl = 'https://platformdev.cloud.coveo.com';
  const organizationId = 'some org id';
  const accessToken = 'some access token';
  const propertyId = 'some property';

  let client: ProductListingV2APIClient;
  let platformCallMock: jest.Mock;

  beforeEach(() => {
    client = buildMockProductListingV2APIClient();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockPlatformCall = (fakeResponse: unknown) => {
    platformCallMock = jest.fn();

    platformCallMock.mockReturnValue(fakeResponse);
    PlatformClient.call = platformCallMock;
  };

  describe('getProducts', () => {
    const buildGetListingV2Request = (
      req: Partial<ProductListingV2Request> = {}
    ): ProductListingV2Request => ({
      accessToken: accessToken,
      organizationId: organizationId,
      platformUrl: platformUrl,
      propertyId: propertyId,
      clientId: req.clientId ?? '',
      context: req.context ?? {
        user: {userAgent: '', userIp: ''},
        view: {pageType: '', url: ''},
      },
      listingId: req.listingId ?? '',
      locale: req.locale ?? '',
      mode: req.mode ?? Mode.Sample,
    });

    it('should call the platform endpoint with the correct arguments', async () => {
      const request = buildGetListingV2Request();

      mockPlatformCall({
        ok: true,
        json: () => Promise.resolve('some content'),
      });

      await client.getListing(request);

      expect(platformCallMock).toBeCalled();
      const mockRequest = platformCallMock.mock.calls[0][0];
      expect(mockRequest).toMatchObject({
        method: 'POST',
        contentType: 'application/json',
        url: `${platformUrl}/rest/organizations/${organizationId}/properties/${propertyId}/commerce/v2/listing`,
        accessToken: request.accessToken,
        origin: 'commerceApiFetch',
        requestParams: {
          clientId: request.clientId,
          context: request.context,
          listingId: request.listingId,
          locale: request.locale,
          mode: request.mode,
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

      const response = await client.getListing(request);

      expect(response).toMatchObject({
        error: expectedError,
      });
    });

    it('should return success response on success', async () => {
      const request = buildGetListingV2Request();

      const expectedBody: ProductListingV2SuccessResponse = {
        products: [],
        facets: [],
        pagination: {page: 0, perPage: 0, totalCount: 0, totalPages: 0},
        responseId: '',
        listingId: '',
        locale: '',
        sort: {
          appliedSort: {by: SortBy.Relevance},
          availableSorts: [{by: SortBy.Relevance}],
        },
      };

      mockPlatformCall({
        ok: true,
        json: () => Promise.resolve(expectedBody),
      });

      const response = await client.getListing(request);

      expect(response).toMatchObject({
        success: expectedBody,
      });
    });
  });
});
