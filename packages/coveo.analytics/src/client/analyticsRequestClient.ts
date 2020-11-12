import {AnyEventResponse, IRequestPayload} from '../events';

export interface VisitorIdProvider {
    getCurrentVisitorId: () => Promise<string>;
    setVisitorId: (visitorId: string) => void;
}

export interface AnalyticsRequestClient {
    sendEvent(eventType: string, payload: IRequestPayload): Promise<AnyEventResponse | void>;
}
