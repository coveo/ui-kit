import {AnyEventResponse, IRequestPayload} from '../events';

export interface VisitorIdProvider {
    currentVisitorId: string;
}

export interface AnalyticsRequestClient {
    sendEvent(eventType: string, payload: IRequestPayload): Promise<AnyEventResponse | void>;
}
