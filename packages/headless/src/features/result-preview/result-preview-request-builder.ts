import {
  HtmlRequest,
  HtmlRequestOptions,
} from '../../api/search/html/html-request';
import {ConfigurationSection, QuerySection} from '../../state/state-sections';

export type StateNeededByHtmlEndpoint = ConfigurationSection &
  Partial<QuerySection>;

export function buildResultPreviewRequest(
  state: StateNeededByHtmlEndpoint,
  options: HtmlRequestOptions
): HtmlRequest {
  const {platformUrl, accessToken, organizationId} = state.configuration;
  const q = state.query?.q || '';

  return {
    url: platformUrl,
    accessToken,
    organizationId,
    enableNavigation: false,
    requestedOutputSize: 0,
    q,
    ...options,
  };
}
