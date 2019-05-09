import { AnalyticsBeaconClient as AnalyticsBeaconClient } from './analyticsBeaconClient';
import { AnalyticsFetchClient } from './analyticsFetchClient';
import {
    AnyEventResponse,
    ClickEventRequest,
    ClickEventResponse,
    CustomEventRequest,
    CustomEventResponse,
    EventBaseRequest,
    EventType,
    HealthResponse,
    SearchEventRequest,
    SearchEventResponse,
    ViewEventRequest,
    ViewEventResponse,
    VisitResponse,
    IRequestPayload
} from '../events';
import { HistoryStore } from '../history';
import { VisitorIdProvider } from './analyticsRequestClient';

export const Version = 'v15';

export const Endpoints = {
    default: 'https://usageanalytics.coveo.com',
    production: 'https://usageanalytics.coveo.com',
    hipaa: 'https://usageanalyticshipaa.coveo.com'
};

export interface ClientOptions {
    token: string;
    endpoint: string;
    version: string;
}

export interface AnalyticsClient {
    sendEvent(eventType: string, payload: any): Promise<AnyEventResponse | void>;
    sendSearchEvent(request: SearchEventRequest): Promise<SearchEventResponse | void>;
    sendClickEvent(request: ClickEventRequest): Promise<ClickEventResponse | void>;
    sendCustomEvent(request: CustomEventRequest): Promise<CustomEventResponse | void>;
    sendViewEvent(request: ViewEventRequest): Promise<ViewEventResponse | void>;
    getVisit(): Promise<VisitResponse>;
    getHealth(): Promise<HealthResponse>;
}

interface BufferedRequest {
    eventType: EventType;
    payload: any;
    handled: boolean;
}

export class CoveoAnalyticsClient implements AnalyticsClient, VisitorIdProvider {
    private get defaultOptions(): ClientOptions {
        return {
            endpoint: Endpoints.default,
            token: '',
            version: Version
        };
    }

    private visitorId: string;
    private analyticsBeaconClient: AnalyticsBeaconClient;
    private analyticsFetchClient: AnalyticsFetchClient;
    private bufferedRequests: BufferedRequest[];
    private options: ClientOptions;

    constructor(opts: Partial<ClientOptions>) {
        if (!opts) {
            throw new Error('You have to pass options to this constructor');
        }

        this.options = {
            ...this.defaultOptions,
            ...opts
        };

        const {
            token,
        } = this.options;

        this.visitorId = '';
        this.bufferedRequests = [];

        this.analyticsBeaconClient = new AnalyticsBeaconClient(this.baseUrl, token, this);
        this.analyticsFetchClient = new AnalyticsFetchClient(this.baseUrl, token, this);
        window.addEventListener('beforeunload', () => this.flushBufferWithBeacon());
    }

    get currentVisitorId() {
        return this.visitorId;
    }

    set currentVisitorId(visitorId: string) {
        this.visitorId = visitorId;
    }

    async sendEvent(eventType: EventType, payload: IRequestPayload): Promise<AnyEventResponse | void> {
        if (eventType === 'view') {
            this.addPageViewToHistory(payload.contentIdValue);
        }

        const payloadForEvent = this.getPayloadForTypeOfEvent(eventType, payload);
        const cleanedPayload = this.removeEmptyPayloadValues(payloadForEvent);

        this.bufferedRequests.push({
            eventType,
            payload: cleanedPayload,
            handled: false
        });

        await this.deferExecution();
        return await this.sendFromBufferWithFetch();
    }

    private deferExecution(): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, 0));
    }

    private flushBufferWithBeacon(): void {
        while (this.hasPendingRequests()) {
            const { eventType, payload } = this.bufferedRequests.pop() as BufferedRequest;
            this.analyticsBeaconClient.sendEvent(eventType, payload);
        }
    }

    private async sendFromBufferWithFetch(): Promise<AnyEventResponse | void> {
        if (this.hasPendingRequests()) {
            const popped = this.bufferedRequests.pop();
            if (popped) {
                const { eventType, payload } = popped;
                return this.analyticsFetchClient.sendEvent(eventType, payload);
            }
        }
    }

    private hasPendingRequests(): boolean {
        return this.bufferedRequests.length > 0;
    }

    async sendSearchEvent(request: SearchEventRequest): Promise<SearchEventResponse | void> {
        return this.sendEvent(EventType.search, request);
    }

    async sendClickEvent(request: ClickEventRequest): Promise<ClickEventResponse | void> {
        return this.sendEvent(EventType.click, request);
    }

    async sendCustomEvent(request: CustomEventRequest): Promise<CustomEventResponse | void> {
        return this.sendEvent(EventType.custom, request);
    }

    async sendViewEvent(request: ViewEventRequest): Promise<ViewEventResponse | void> {
        return this.sendEvent(EventType.view, request);
    }

    async getVisit(): Promise<VisitResponse> {
        const response = await fetch(`${this.baseUrl}/analytics/visit`);
        const visit = await response.json() as VisitResponse;
        this.visitorId = visit.visitorId;
        return visit;
    }

    async getHealth(): Promise<HealthResponse> {
        const response = await fetch(`${this.baseUrl}/analytics/monitoring/health`);
        return await response.json() as HealthResponse;
    }

    private addPageViewToHistory(pageViewValue: string) {
        const store = new HistoryStore();
        const historyElement = {
            name: 'PageView',
            value: pageViewValue,
            time: JSON.stringify(new Date()),
        };
        store.addElement(historyElement);
    }

    private getPayloadForTypeOfEvent(eventType: EventType, payload: any) {
        const baseDefaultValues: EventBaseRequest = {
            language: document.documentElement.lang,
            userAgent: navigator.userAgent
        };
        if (eventType === 'view') {
            return {
                location: window.location.toString(),
                referrer: document.referrer,
                title: document.title,
                ...baseDefaultValues,
                ...payload
            } as ViewEventRequest;
        } else {
            return {
                ...baseDefaultValues,
                ...payload
            };
        }
    }

    private removeEmptyPayloadValues(payload: IRequestPayload): IRequestPayload {
        return Object.keys(payload)
            .filter(key => !!payload[key])
            .reduce((newPayload, key) => ({
                ...newPayload,
                [key]: payload[key]
            }), {});
    }

    private get baseUrl(): string {
        const { version, endpoint } = this.options;
        return `${endpoint}/rest/${version}`;
    }
}

/** @deprecated Use CoveoAnalyticsClient instead. */
export const Client = CoveoAnalyticsClient;

export default CoveoAnalyticsClient;
