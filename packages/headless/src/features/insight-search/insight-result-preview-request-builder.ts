import {getVisitorID} from '../../api/analytics/search-analytics';
import {
  HtmlRequest,
  HtmlRequestOptions,
} from '../../api/search/html/html-request';
import {StateNeededByHtmlEndpoint} from '../result-preview/result-preview-request-builder';

export async function buildInsightResultPreviewRequest(
  state: StateNeededByHtmlEndpoint,
  options: HtmlRequestOptions,
  url: string
): Promise<HtmlRequest> {
  const {accessToken, organizationId, analytics} = state.configuration;
  const q = state.query?.q || '';

  return {
    url,
    accessToken,
    organizationId,
    enableNavigation: false,
    ...(analytics.enabled && {
      visitorId: await getVisitorID(state.configuration.analytics),
    }),
    q,
    ...options,
    requestedOutputSize: options.requestedOutputSize || 0,
  };
}
