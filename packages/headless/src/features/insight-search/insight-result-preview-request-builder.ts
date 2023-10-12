import {getVisitorID} from '../../api/analytics/coveo-analytics-utils.js';
import {
  HtmlRequest,
  HtmlRequestOptions,
} from '../../api/search/html/html-request.js';
import {baseInsightUrl} from '../../api/service/insight/insight-params.js';
import {InsightConfigurationSection} from '../../state/state-sections.js';
import {StateNeededByHtmlEndpoint} from '../result-preview/result-preview-request-builder.js';

export type StateNeededByInsightHtmlEndpoint = StateNeededByHtmlEndpoint &
  InsightConfigurationSection;

export async function buildInsightResultPreviewRequest(
  state: StateNeededByInsightHtmlEndpoint,
  options: HtmlRequestOptions
): Promise<HtmlRequest> {
  const {platformUrl, accessToken, organizationId, analytics} =
    state.configuration;
  const {insightId} = state.insightConfiguration;

  const q = state.query?.q || '';
  const url = baseInsightUrl({
    url: platformUrl,
    accessToken,
    organizationId,
    insightId,
  });

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
