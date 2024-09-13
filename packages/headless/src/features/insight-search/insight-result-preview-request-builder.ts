import {getVisitorID} from '../../api/analytics/coveo-analytics-utils';
import {getOrganizationEndpoint} from '../../api/platform-client';
import {
  HtmlRequest,
  HtmlRequestOptions,
} from '../../api/search/html/html-request';
import {baseInsightUrl} from '../../api/service/insight/insight-params';
import {InsightConfigurationSection} from '../../state/state-sections';
import {StateNeededByHtmlEndpoint} from '../result-preview/result-preview-request-builder';

export type StateNeededByInsightHtmlEndpoint = StateNeededByHtmlEndpoint &
  InsightConfigurationSection;

export async function buildInsightResultPreviewRequest(
  state: StateNeededByInsightHtmlEndpoint,
  options: HtmlRequestOptions
): Promise<HtmlRequest> {
  const {accessToken, organizationId, analytics, environment} =
    state.configuration;
  const {insightId} = state.insightConfiguration;

  const q = state.query?.q || '';
  const url = baseInsightUrl({
    url: getOrganizationEndpoint(organizationId, 'platform', environment),
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
