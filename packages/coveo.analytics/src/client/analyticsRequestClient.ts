import { AnyEventResponse } from '../events';

export interface VisitorIdProvider {
    currentVisitorId: string;
}

export interface AnalyticsRequestClient {
    sendEvent(eventType: string, request: any): Promise<AnyEventResponse | void>;
}
