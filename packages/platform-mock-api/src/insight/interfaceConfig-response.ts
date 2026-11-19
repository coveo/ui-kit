/**
 * Mirrors Headless's `GetInsightInterfaceConfigResponse`
 * (`packages/headless/src/api/service/insight/get-interface/get-interface-config-response.ts`),
 * with `interface` loosened to `Record<string, unknown>`.
 */
export interface InsightInterfaceConfigResponse {
  contextFields: Record<string, string>;
  searchHub: string;
  interface?: Record<string, unknown>;
}

export const baseResponse: InsightInterfaceConfigResponse = {
  contextFields: {},
  searchHub: 'insight-default',
};
