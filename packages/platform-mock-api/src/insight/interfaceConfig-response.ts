export interface InsightInterfaceConfigResponse {
  contextFields: Record<string, string>;
  searchHub: string;
  interface?: Record<string, unknown>;
}

export const baseResponse: InsightInterfaceConfigResponse = {
  contextFields: {},
  searchHub: 'insight-default',
};
