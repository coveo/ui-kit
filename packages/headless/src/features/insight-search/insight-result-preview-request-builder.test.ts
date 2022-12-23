import {HtmlRequestOptions} from '../../api/search/html/html-request';
import {getConfigurationInitialState} from '../configuration/configuration-state';
import {getQueryInitialState} from '../query/query-state';
import {StateNeededByHtmlEndpoint} from '../result-preview/result-preview-request-builder';
import {getResultPreviewInitialState} from '../result-preview/result-preview-state';
import {buildInsightResultPreviewRequest} from './insight-result-preview-request-builder';

describe('ResultPreviewRequestBuilder', () => {
  let state: StateNeededByHtmlEndpoint;
  let options: HtmlRequestOptions;

  const testUrl = 'http://test.url.com';

  beforeEach(() => {
    state = {
      configuration: getConfigurationInitialState(),
      resultPreview: getResultPreviewInitialState(),
      query: getQueryInitialState(),
    };
    options = {
      uniqueId: '1',
    };
  });

  it('should build the quickview request with the given parameters', async () => {
    options.requestedOutputSize = undefined;
    const finalRequest = await buildInsightResultPreviewRequest(
      state,
      options,
      testUrl
    );
    expect(finalRequest).toEqual({
      accessToken: '',
      enableNavigation: false,
      organizationId: '',
      q: '',
      requestedOutputSize: 0,
      uniqueId: '1',
      url: testUrl,
      visitorId: expect.any(String),
    });
  });
});
