import type {FullEngine} from '@/src/internal/engine/index.js';

export interface AnalyticsParams {
  clientId: string;
  clientTimestamp: string;
  documentReferrer: string | null;
  originContext: string;
  documentLocation?: string | null;
  trackingId?: string;
}

export interface AnalyticsParamsOptions {
  originContext: string;
  trackingId?: string;
}

export function buildAnalyticsParams(
  engine: FullEngine,
  options: AnalyticsParamsOptions
): AnalyticsParams | undefined {
  const navigatorContextProvider = engine.getNavigatorContextProvider();
  if (!navigatorContextProvider) {
    return undefined;
  }

  const context = navigatorContextProvider();
  const trackingId = options.trackingId;

  return {
    clientId: context.clientId,
    clientTimestamp: new Date().toISOString(),
    documentReferrer: context.referrer,
    originContext: options.originContext,
    documentLocation: context.location,
    ...(trackingId && {trackingId}),
  };
}
