import {getSearchApiBaseUrl} from '../../api/platform-client.js';
import type {HtmlRequest, HtmlRequestOptions} from '../../api/search/html/html-request.js';
import type {
  ConfigurationSection,
  QuerySection,
  ResultPreviewSection,
} from '../../state/state-sections.js';

export type StateNeededByHtmlEndpoint = ConfigurationSection &
  ResultPreviewSection &
  Partial<QuerySection>;

export async function buildResultPreviewRequest(
  state: StateNeededByHtmlEndpoint,
  options: HtmlRequestOptions
): Promise<HtmlRequest> {
  const {search, accessToken, organizationId} = state.configuration;
  const {highlightTerms = true, ...requestOptions} = options;
  const q = highlightTerms ? state.query?.q || '' : '';

  return {
    url:
      search.apiBaseUrl ??
      getSearchApiBaseUrl(state.configuration.organizationId, state.configuration.environment),
    accessToken,
    organizationId,
    enableNavigation: false,
    q,
    ...requestOptions,
    requestedOutputSize: requestOptions.requestedOutputSize || 0,
    ...(search.authenticationProviders.length && {
      authentication: search.authenticationProviders.join(','),
    }),
  };
}
