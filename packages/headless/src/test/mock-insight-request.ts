import {InsightQueryRequest} from '../api/service/insight/query/query-request';

export function buildMockInsightQueryRequest(
  config?: Partial<InsightQueryRequest>
): InsightQueryRequest {
  return {
    accessToken: '',
    url: '',
    organizationId: '',
    insightId: '',
    tab: '',
    ...config,
  };
}
