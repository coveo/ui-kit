import { AnalyticsClient } from '../../src/analytics';
import {
    AnyEventResponse,
    ClickEventRequest,
    ClickEventResponse,
    CustomEventRequest,
    CustomEventResponse,
    HealthResponse,
    SearchEventRequest,
    SearchEventResponse,
    ViewEventRequest,
    ViewEventResponse,
    VisitResponse
    } from '../../src/events';

export class AnalyticsClientMock implements AnalyticsClient {
    sendEvent(eventType: string, request: any): Promise<AnyEventResponse> {
        return Promise.resolve({} as AnyEventResponse);
    }
    sendSearchEvent(request: SearchEventRequest): Promise<SearchEventResponse> {
        return Promise.resolve({} as SearchEventResponse);
    }
    sendClickEvent(request: ClickEventRequest): Promise<ClickEventResponse> {
        return Promise.resolve({} as ClickEventResponse);
    }
    sendCustomEvent(request: CustomEventRequest): Promise<CustomEventResponse> {
        return Promise.resolve({} as CustomEventResponse);
    }
    sendViewEvent(request: ViewEventRequest): Promise<ViewEventResponse> {
        return Promise.resolve({} as ViewEventResponse);
    }
    getVisit(): Promise<VisitResponse> {
        return Promise.resolve({} as VisitResponse);
    }
    getHealth(): Promise<HealthResponse> {
        return Promise.resolve({} as HealthResponse);
    }
}

export default AnalyticsClientMock;
