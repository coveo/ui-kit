import {
  buildResultPreviewRequest,
  StateNeededByHtmlEndpoint,
} from '../result-preview/result-preview-request-builder';
import {HtmlRequestOptions} from '../../api/search/html/html-request';
import {getResultPreviewInitialState} from './result-preview-state';
import {getConfigurationInitialState} from '../configuration/configuration-state';
import {getQueryInitialState} from '../query/query-state';

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

  it('when the #options.requestedeOutputSize is set to undefined, it initializes the result preview request correctly with requestedOutputSize set to 0', () => {
    options.requestedOutputSize = undefined;
    const finalRequest = buildResultPreviewRequest(state, options);
    expect(finalRequest).toEqual({
      accessToken: '',
      enableNavigation: false,
      organizationId: '',
      q: '',
      requestedOutputSize: 0,
      uniqueId: '1',
      url: 'https://platform.cloud.coveo.com/rest/search/v2',
    });
  });
});
