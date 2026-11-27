import {getSearchApiBaseUrl} from '../../api/platform-client.js';
import type {HtmlRequestOptions} from '../../api/search/html/html-request.js';
import {getConfigurationInitialState} from '../configuration/configuration-state.js';
import {getQueryInitialState} from '../query/query-state.js';
import {
  buildResultPreviewRequest,
  type StateNeededByHtmlEndpoint,
} from '../result-preview/result-preview-request-builder.js';
import {getResultPreviewInitialState} from './result-preview-state.js';

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
      url: getSearchApiBaseUrl(''),
    });
  });

  describe('when the query has terms', () => {
    beforeEach(() => {
      state.query = {...getQueryInitialState(), q: 'some terms'};
    });

    it('sends the query by default', async () => {
      const request = await buildResultPreviewRequest(state, options);
      expect(request.q).toBe('some terms');
    });

    it('does not send the query when #options.highlightTerms is false', async () => {
      const request = await buildResultPreviewRequest(state, {
        ...options,
        highlightTerms: false,
      });
      expect(request.q).toBe('');
    });

    it('does not include #highlightTerms in the request', async () => {
      const request = await buildResultPreviewRequest(state, {
        ...options,
        highlightTerms: false,
      });
      expect(request).not.toHaveProperty('highlightTerms');
    });
  });
});
