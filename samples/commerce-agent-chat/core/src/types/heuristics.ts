export type QueryRouteDecision = 'search' | 'agent';

export interface ClassifyResponse {
  decision: QueryRouteDecision;
}
