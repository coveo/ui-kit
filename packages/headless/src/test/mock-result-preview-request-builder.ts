import {
  HtmlRequestOptions,
  HtmlRequest,
} from '../api/search/html/html-request.js';
import {StateNeededByHtmlEndpoint} from '../features/result-preview/result-preview-request-builder.js';

export async function buildMockResultPreviewRequest(
  _state: StateNeededByHtmlEndpoint,
  options: HtmlRequestOptions
): Promise<HtmlRequest> {
  return {
    url: 'https://testurl.coveo.com',
    accessToken: 'access-token-xxxxx',
    organizationId: 'some-org-id',
    enableNavigation: false,
    visitorId: 'visitor-id',
    q: 'query',
    requestedOutputSize: options.requestedOutputSize || 0,
    ...options,
  };
}
