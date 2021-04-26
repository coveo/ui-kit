import {AnalyticsClient} from './analytics';
import {
    AnyEventResponse,
    SearchEventResponse,
    ClickEventResponse,
    CustomEventResponse,
    VisitResponse,
    HealthResponse,
    ViewEventResponse,
} from '../events';
import {NoopRuntime} from './runtimeEnvironment';

export class NoopAnalytics implements AnalyticsClient {
    getPayload(): Promise<any> {
        return Promise.resolve();
    }
    getParameters(): Promise<any> {
        return Promise.resolve();
    }
    sendEvent(): Promise<AnyEventResponse | void> {
        return Promise.resolve();
    }
    sendSearchEvent(): Promise<SearchEventResponse | void> {
        return Promise.resolve();
    }
    sendClickEvent(): Promise<ClickEventResponse | void> {
        return Promise.resolve();
    }
    sendCustomEvent(): Promise<CustomEventResponse | void> {
        return Promise.resolve();
    }
    sendViewEvent(): Promise<ViewEventResponse | void> {
        return Promise.resolve();
    }
    getVisit(): Promise<VisitResponse> {
        return Promise.resolve({id: '', visitorId: ''});
    }
    getHealth(): Promise<HealthResponse> {
        return Promise.resolve({status: ''});
    }
    registerBeforeSendEventHook(): void {}
    registerAfterSendEventHook(): void {}
    addEventTypeMapping(): void {}
    runtime = new NoopRuntime();
    currentVisitorId = '';
}
