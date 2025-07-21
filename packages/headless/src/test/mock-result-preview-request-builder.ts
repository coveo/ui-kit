import type {
  HtmlRequest,
  HtmlRequestOptions,
} from '../api/search/html/html-request.js';
import type {StateNeededByHtmlEndpoint} from '../features/result-preview/result-preview-request-builder.js';

export async function buildMockResultPreviewRequest(
  _state: StateNeededByHtmlEndpoint,
  options: HtmlRequestOptions
): Promise<HtmlRequest> {
  return {
    url: 'https://testurl.coveo.com',
    accessToken: 'access-token-xxxxx',
    organizationId: 'some-org-id',
    enableNavigation: false,
    q: 'query',
    requestedOutputSize: options.requestedOutputSize || 0,
    ...options,
  };
}
