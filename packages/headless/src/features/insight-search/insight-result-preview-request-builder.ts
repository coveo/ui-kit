import {getOrganizationEndpoint} from '../../api/platform-client.js';
import type {
  HtmlRequest,
  HtmlRequestOptions,
} from '../../api/search/html/html-request.js';
import {baseInsightUrl} from '../../api/service/insight/insight-params.js';
import type {InsightConfigurationSection} from '../../state/state-sections.js';
import type {StateNeededByHtmlEndpoint} from '../result-preview/result-preview-request-builder.js';

export type StateNeededByInsightHtmlEndpoint = StateNeededByHtmlEndpoint &
  InsightConfigurationSection;

export async function buildInsightResultPreviewRequest(
  state: StateNeededByInsightHtmlEndpoint,
  options: HtmlRequestOptions
): Promise<HtmlRequest> {
  const {accessToken, organizationId, environment} = state.configuration;
  const {insightId} = state.insightConfiguration;

  const q = state.query?.q || '';
  const url = baseInsightUrl({
    url: getOrganizationEndpoint(organizationId, environment),
    accessToken,
    organizationId,
    insightId,
  });

  return {
    url,
    accessToken,
    organizationId,
    enableNavigation: false,
    q,
    ...options,
    requestedOutputSize: options.requestedOutputSize || 0,
  };
}
