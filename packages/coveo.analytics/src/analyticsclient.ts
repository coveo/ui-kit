import {
    SearchEventRequest, SearchEventResponse,
    ClickEventRequest, ClickEventResponse,
    CustomEventRequest, CustomEventResponse,
    ViewEventRequest, ViewEventResponse,
    VisitResponse, HealthResponse
} from './events';

export interface AnalyticsClient {
    sendEvent(eventType: string, request: any): Promise<Response>;
    sendSearchEvent(request: SearchEventRequest): Promise<SearchEventResponse>;
    sendClickEvent(request: ClickEventRequest): Promise<ClickEventResponse>;
    sendCustomEvent(request: CustomEventRequest): Promise<CustomEventResponse>;
    sendViewEvent(request: ViewEventRequest): Promise<ViewEventResponse>;
    getVisit(): Promise<VisitResponse>;
    getHealth(): Promise<HealthResponse>;
};

export default AnalyticsClient;
