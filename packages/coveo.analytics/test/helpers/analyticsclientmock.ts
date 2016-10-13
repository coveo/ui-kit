import AnalyticsClient from '../../src/analyticsclient';
import {
    SearchEventRequest, SearchEventResponse,
    ClickEventRequest, ClickEventResponse,
    CustomEventRequest, CustomEventResponse,
    ViewEventRequest, ViewEventResponse,
    VisitResponse, HealthResponse
} from '../../src/events';

export class AnalyticsClientMock implements AnalyticsClient {
    sendEvent(eventType: string, request: any): Promise<Response> {
        return Promise.resolve();
    }
    sendSearchEvent(request: SearchEventRequest): Promise<SearchEventResponse> {
        return Promise.resolve();
    }
    sendClickEvent(request: ClickEventRequest): Promise<ClickEventResponse> {
        return Promise.resolve();
    }
    sendCustomEvent(request: CustomEventRequest): Promise<CustomEventResponse> {
        return Promise.resolve();
    }
    sendViewEvent(request: ViewEventRequest): Promise<ViewEventResponse> {
        return Promise.resolve();
    }
    getVisit(): Promise<VisitResponse> {
        return Promise.resolve();
    }
    getHealth(): Promise<HealthResponse> {
        return Promise.resolve();
    }
}

export default AnalyticsClientMock;
