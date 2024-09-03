import {HtmlRequestOptions} from '../../api/search/html/html-request';
import {getConfigurationInitialState} from '../configuration/configuration-state';
import {getQueryInitialState} from '../query/query-state';
import {
  buildResultPreviewRequest,
  StateNeededByHtmlEndpoint,
} from '../result-preview/result-preview-request-builder';
import {getResultPreviewInitialState} from './result-preview-state';

describe('ResultPreviewRequestBuilder', () => {
  let state: StateNeededByHtmlEndpoint;
  let options: HtmlRequestOptions;

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

  it('when the #options.requestedeOutputSize is set to undefined, it initializes the result preview request correctly with requestedOutputSize set to 0', async () => {
    options.requestedOutputSize = undefined;
    const finalRequest = await buildResultPreviewRequest(state, options);
    expect(finalRequest).toEqual({
      accessToken: '',
      enableNavigation: false,
      organizationId: '',
      q: '',
      requestedOutputSize: 0,
      uniqueId: '1',
      url: '',
      visitorId: expect.any(String),
    });
  });
});
