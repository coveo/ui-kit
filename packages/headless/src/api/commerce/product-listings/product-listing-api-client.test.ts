import {buildMockProductListingAPIClient} from '../../../test/mock-product-listing-api-client';
import {PlatformClient} from '../../platform-client';
import {ProductListingAPIClient} from './product-listing-api-client';
import {
  ProductListingRequest,
  ProductListingSuccessResponse,
} from './product-listing-request';

describe('product listing api client', () => {
  const platformUrl = 'https://platformdev.cloud.coveo.com';
  const organizationId = 'some org id';
  const accessToken = 'some access token';
  const url = 'http://bloup.com/🐟';

  let client: ProductListingAPIClient;
  let platformCallMock: jest.Mock;

  beforeEach(() => {
    client = buildMockProductListingAPIClient();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockPlatformCall = (fakeResponse: any) => {
    platformCallMock = jest.fn();

    platformCallMock.mockReturnValue(fakeResponse);
    PlatformClient.call = platformCallMock;
  };

  describe('getProducts', () => {
    const buildGetProductsRequest = (
      req: Partial<ProductListingRequest> = {}
    ): ProductListingRequest => ({
      platformUrl,
      organizationId,
      accessToken,
      url,
      ...req,
    });

    it('should call the platform endpoint with the correct arguments', async () => {
      const request = buildGetProductsRequest({
        additionalFields: ['some field'],
      });

      mockPlatformCall({
        ok: true,
        json: () => Promise.resolve('some content'),
      });

      await client.getProducts(request);

      expect(platformCallMock).toBeCalled();
      const mockRequest = platformCallMock.mock.calls[0][0];
      expect(mockRequest).toMatchObject({
        method: 'POST',
        contentType: 'application/json',
        url: `${request.platformUrl}/rest/organizations/${request.organizationId}/commerce/v1/products/listing`,
        accessToken: request.accessToken,
        requestParams: {
          url: request.url,
          additionalFields: request.additionalFields,
        },
      });
    });

    it('should return error response on failure', async () => {
      const request = buildGetProductsRequest();

      const expectedError = {
        statusCode: 401,
        message: 'Unauthorized',
        type: 'authorization',
      };

      mockPlatformCall({
        ok: false,
        json: () => Promise.resolve(expectedError),
      });

      const response = await client.getProducts(request);

      expect(response).toMatchObject({
        error: expectedError,
      });
    });

    it('should return success response on success', async () => {
      const request = buildGetProductsRequest();

      const expectedBody: ProductListingSuccessResponse = {
        products: [],
        pagination: {
          totalCount: 31,
        },
        responseId: 'ba7e83ac-6b54-46c1-8789-01f144cfd3b1',
      };

      mockPlatformCall({
        ok: true,
        json: () => Promise.resolve(expectedBody),
      });

      const response = await client.getProducts(request);

      expect(response).toMatchObject({
        success: expectedBody,
      });
    });
  });
});
