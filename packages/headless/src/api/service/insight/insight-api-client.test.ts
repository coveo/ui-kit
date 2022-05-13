import pino from 'pino';
import {PlatformClient} from '../../platform-client';
import {NoopPreprocessRequest} from '../../preprocess-request';
import {InsightAPIClient} from './insight-api-client';

describe('insight api client', () => {
  const insightRequest = {
    accessToken: 'some token',
    insightId: 'some insight id',
    organizationId: 'some organization id',
    url: 'https://some.platform.com',
  };

  let client: InsightAPIClient;

  beforeEach(() => {
    client = new InsightAPIClient({
      preprocessRequest: NoopPreprocessRequest,
      logger: pino({level: 'silent'}),
    });
  });

  describe('getInterface', () => {
    it('should call the platform endpoint with the correct arguments', async () => {
      const callSpy = jest.spyOn(PlatformClient, 'call').mockResolvedValue({
        ok: true,
        json: () => Promise.resolve('some content'),
      } as unknown as Response);

      await client.getInterface(insightRequest);

      expect(callSpy).toHaveBeenCalled();
      const mockRequest = callSpy.mock.calls[0][0];
      expect(mockRequest).toMatchObject({
        accessToken: insightRequest.accessToken,
        method: 'GET',
        contentType: 'application/json',
        url: `${insightRequest.url}/rest/organizations/${insightRequest.organizationId}/insight/v1/${insightRequest.insightId}/interface`,
      });
    });

    it.todo('should return success response on success');
    it.todo('should return error response on failure');
  });

  describe('query', () => {
    it.todo('should call the platform endpoint with the correct arguments');
    it.todo('should return success response on success');
    it.todo('should return error response on failure');
  });

  describe('userActions', () => {
    it.todo('should call the platform endpoint with the correct arguments');
    it.todo('should return success response on success');
    it.todo('should return error response on failure');
  });
});
