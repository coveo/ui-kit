import type {HtmlRequestOptions} from '../../api/search/html/html-request.js';
import {getConfigurationInitialState} from '../configuration/configuration-state.js';
import {getQueryInitialState} from '../query/query-state.js';
import {getResultPreviewInitialState} from '../result-preview/result-preview-state.js';
import {
  buildInsightResultPreviewRequest,
  type StateNeededByInsightHtmlEndpoint,
} from './insight-result-preview-request-builder.js';

describe('ResultPreviewRequestBuilder', () => {
  let state: StateNeededByInsightHtmlEndpoint;
  let options: HtmlRequestOptions;

  const testOrgId = 'someOrgId';
  const testConfigId = 'some-insight-id-123';
  const expectedUrl = `https://someOrgId.org.coveo.com/rest/organizations/${testOrgId}/insight/v1/configs/${testConfigId}`;

  const configurationInitialState = getConfigurationInitialState();

  beforeEach(() => {
    state = {
      configuration: {
        ...configurationInitialState,
        organizationId: testOrgId,
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
    });
  });
});
