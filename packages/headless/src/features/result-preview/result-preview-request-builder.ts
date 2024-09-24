import {getVisitorID} from '../../api/analytics/coveo-analytics-utils.js';
import {getSearchApiBaseUrl} from '../../api/platform-client.js';
import {
  HtmlRequest,
  HtmlRequestOptions,
} from '../../api/search/html/html-request.js';
import {
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
  const {search, accessToken, organizationId, analytics} = state.configuration;
  const q = state.query?.q || '';

  return {
    url:
      search.apiBaseUrl ??
      getSearchApiBaseUrl(
        state.configuration.organizationId,
        state.configuration.environment
      ),
    accessToken,
    organizationId,
    enableNavigation: false,
    ...(analytics.enabled && {
      visitorId: await getVisitorID(state.configuration.analytics),
    }),
    q,
    ...options,
    requestedOutputSize: options.requestedOutputSize || 0,
    ...(search.authenticationProviders.length && {
      authentication: search.authenticationProviders.join(','),
    }),
  };
}
