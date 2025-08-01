import {
  baseInsightRequest,
  type InsightParam,
  pickNonInsightParams,
} from './insight-params.js';

describe('insight params', () => {
  const method = 'POST';
  const contentType = 'application/json';
  const path = '/some-path';

  const request: InsightParam = {
    accessToken: 'some access token',
    organizationId: 'some organization id',
    insightId: 'some insight id',
    url: 'https://dummy.platform.cloud.coveo.com',
  };

  describe('baseInsightRequest', () => {
    it('should build the request object', () => {
      const effective = baseInsightRequest(request, method, contentType, path);

      expect(effective).toEqual({
        accessToken: request.accessToken,
        method,
        contentType,
        origin: 'insightApiFetch',
        url: `${request.url}/rest/organizations/${request.organizationId}/insight/v1/configs/${request.insightId}${path}`,
      });
    });

    describe('when mandatory parameters are missing', () => {
      it('should validate if #url is missing', () => {
        const req = {...request, url: ''};
        expect(() => {
          baseInsightRequest(req, method, contentType, path);
        }).toThrow();
      });

      it('should validate if #organizationId is missing', () => {
        const req = {...request, organizationId: ''};
        expect(() => {
          baseInsightRequest(req, method, contentType, path);
        }).toThrow();
      });

      it('should validate if #accessToken is missing', () => {
        const req = {...request, accessToken: ''};
        expect(() => {
          baseInsightRequest(req, method, contentType, path);
        }).toThrow();
      });

      it('should validate if #insightId is missing', () => {
        const req = {...request, insightId: ''};
        expect(() => {
          baseInsightRequest(req, method, contentType, path);
        }).toThrow();
      });
    });
  });

  describe('pickNonInsightParams', () => {
    it('should remove insight parameters from request', () => {
      const req = {...request, someNewParam: 'some value'};

      const result = pickNonInsightParams(req);

      expect(result).toStrictEqual({someNewParam: 'some value'});
    });
  });
});
