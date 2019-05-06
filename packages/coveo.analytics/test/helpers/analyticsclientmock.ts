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
        return Promise.resolve({} as Response);
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
