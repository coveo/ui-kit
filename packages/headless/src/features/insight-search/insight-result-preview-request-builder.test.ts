import {getDefaultOrganizationEndpointBaseUrl} from '../../api/platform-client';
import {HtmlRequestOptions} from '../../api/search/html/html-request';
import {getConfigurationInitialState} from '../configuration/configuration-state';
import {getQueryInitialState} from '../query/query-state';
import {getResultPreviewInitialState} from '../result-preview/result-preview-state';
import {
  buildInsightResultPreviewRequest,
  StateNeededByInsightHtmlEndpoint,
} from './insight-result-preview-request-builder';

describe('ResultPreviewRequestBuilder', () => {
  let state: StateNeededByInsightHtmlEndpoint;
  let options: HtmlRequestOptions;

  const testOrgId = 'someOrgId';
  const testConfigId = 'some-insight-id-123';
  const expectedUrl = `https://someOrgId.org.coveo.com/rest/organizations/${testOrgId}/insight/v1/configs/${testConfigId}`;

  const configurationInitialState = getConfigurationInitialState();

  const {environment} = configurationInitialState;

  beforeEach(() => {
    state = {
      configuration: {
        ...configurationInitialState,
        organizationId: testOrgId,
        platformUrl: getDefaultOrganizationEndpointBaseUrl(
          testOrgId,
          'platform',
          environment
        ),
      },
      resultPreview: getResultPreviewInitialState(),
      query: getQueryInitialState(),
      insightConfiguration: {
        insightId: testConfigId,
      },
    };
    options = {
      uniqueId: '1',
    };
  });

  it('should build the quickview request with the given parameters', async () => {
    options.requestedOutputSize = undefined;
    const finalRequest = await buildInsightResultPreviewRequest(state, options);
    expect(finalRequest).toEqual({
      accessToken: '',
      enableNavigation: false,
      organizationId: testOrgId,
      q: '',
      requestedOutputSize: 0,
      uniqueId: '1',
      url: expectedUrl,
      visitorId: expect.any(String),
    });
  });
});
