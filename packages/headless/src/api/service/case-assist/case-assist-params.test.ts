import {
  baseCaseAssistRequest,
  type CaseAssistParam,
  prepareContextFromFields,
  prepareSuggestionRequestFields,
} from './case-assist-params.js';

describe('case assist params', () => {
  describe('baseCaseAssistRequest', () => {
    const method = 'POST';
    const contentType = 'application/json';
    const path = '/some-path';

    const request: CaseAssistParam = {
      accessToken: 'some access token',
      caseAssistId: 'some case assist id',
      organizationId: 'some organization id',
      url: 'https://dummy.platform.cloud.coveo.com',
    };

    it('should build request object', () => {
      const effective = baseCaseAssistRequest(
        request,
        method,
        contentType,
        path
      );

      expect(effective).toEqual({
        accessToken: request.accessToken,
        method,
        contentType,
        origin: 'caseAssistApiFetch',
        url: `${request.url}/rest/organizations/${request.organizationId}/caseassists/${request.caseAssistId}${path}`,
      });
    });

    it('should add query string arguments when specified', () => {
      const effective = baseCaseAssistRequest(
        request,
        method,
        contentType,
        path,
        {
          first: 'one',
          second: 'two',
        }
      );

      expect(effective.url).toEqual(
        expect.stringMatching(/\?first=one&second=two$/)
      );
    });

    it('should URL encode query string arguments when specified', () => {
      const effective = baseCaseAssistRequest(
        request,
        method,
        contentType,
        path,
        {section: 'Q&A'}
      );

      expect(effective.url).toEqual(expect.stringMatching(/\?section=Q%26A$/));
    });
  });

  describe('prepareSuggestionRequestFields', () => {
    it('should structure fields in API format', () => {
      const effective = prepareSuggestionRequestFields({
        myField: {value: 'some value'},
      });

      expect(effective).toEqual({
        myField: {
          value: 'some value',
        },
      });
    });

    it('should omit fields with empty value', () => {
      const effective = prepareSuggestionRequestFields({
        shouldBeSkipped: {value: ''},
        shouldBeKept: {value: 'has some value'},
      });

      expect(effective).toEqual({
        shouldBeKept: {
          value: 'has some value',
        },
      });
    });
  });

  describe('prepareContextFromFields', () => {
    it('should structure fields in API context format', () => {
      const effective = prepareContextFromFields({
        myField: {value: 'some value'},
      });

      expect(effective).toEqual({
        myField: 'some value',
      });
    });

    it('should omit fields with empty value', () => {
      const effective = prepareContextFromFields({
        shouldBeSkipped: {value: ''},
        shouldBeKept: {value: 'has some value'},
      });

      expect(effective).toEqual({
        shouldBeKept: 'has some value',
      });
    });
  });
});
