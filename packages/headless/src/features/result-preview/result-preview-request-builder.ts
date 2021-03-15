import {
  HtmlRequest,
  HtmlRequestOptions,
} from '../../api/search/html/html-request';
import {
  ConfigurationSection,
  QuerySection,
  ResultPreviewSection,
} from '../../state/state-sections';

export type StateNeededByHtmlEndpoint = ConfigurationSection &
  ResultPreviewSection &
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
