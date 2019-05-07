import { AnalyticsFetchClient } from './analyticsFetchClient';
import {
    AnyEventResponse,
    ClickEventRequest,
    ClickEventResponse,
    CustomEventRequest,
    CustomEventResponse,
    EventType,
    HealthResponse,
    SearchEventRequest,
    SearchEventResponse,
    ViewEventRequest,
    ViewEventResponse,
    VisitResponse
    } from '../events';
import { BeaconAnalyticsClient as AnalyticsBeaconClient } from './analyticsBeaconClient';
import { HistoryStore } from '../history';
import { VisitorIdProvider } from './analyticsRequestClient';

export const Version = 'v15';

export const Endpoints = {
    default: 'https://usageanalytics.coveo.com',
    production: 'https://usageanalytics.coveo.com',
    hipaa: 'https://usageanalyticshipaa.coveo.com'
};

export interface ClientOptions {
    token?: string;
    endpoint?: string;
    version?: string;
}

export interface AnalyticsClient {
    sendEvent(eventType: string, request: any): Promise<AnyEventResponse>;
    sendSearchEvent(request: SearchEventRequest): Promise<SearchEventResponse>;
    sendClickEvent(request: ClickEventRequest): Promise<ClickEventResponse>;
    sendCustomEvent(request: CustomEventRequest): Promise<CustomEventResponse>;
    sendViewEvent(request: ViewEventRequest): Promise<ViewEventResponse>;
    getVisit(): Promise<VisitResponse>;
    getHealth(): Promise<HealthResponse>;
}

interface BufferedRequest {
    eventType: EventType;
    request: any;
}

export class CoveoAnalyticsClient implements AnalyticsClient, VisitorIdProvider {
    private visitorId: string;
    private analyticsBeaconClient: AnalyticsBeaconClient;
    private analyticsFetchClient: AnalyticsFetchClient;
    private baseUrl: string;
    private bufferedRequests: BufferedRequest[];

    constructor(opts: ClientOptions) {
        if (typeof opts === 'undefined') {
            throw new Error('You have to pass options to this constructor');
        }

        const {
            token,
            endpoint,
            version
        } = {
            endpoint: Endpoints.default,
            version: Version,
            ...opts
        };

        this.baseUrl = `${endpoint}/rest/${version}`;
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

    async sendEvent(eventType: EventType, request: any): Promise<AnyEventResponse> {
        if (eventType === 'view') {
            this.addPageViewToHistory(request.contentIdValue);
        }

        this.bufferedRequests.push({
            eventType,
            request
        });

        await this.deferExecution();
        return await this.sendFromBufferWithFetch();
    }

    private deferExecution(): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, 0));
    }

    private flushBufferWithBeacon(): void {
        while (this.bufferedRequests.length > 0) {
            let { eventType, request } = this.bufferedRequests.pop();
            this.analyticsBeaconClient.sendEvent(eventType, request);
        }
    }

    private sendFromBufferWithFetch(): Promise<AnyEventResponse> {
        if (this.bufferedRequests.length > 0) {
            const { eventType, request } = this.bufferedRequests.pop();
            return this.analyticsFetchClient.sendEvent(eventType, request);
        }
    }

    async sendSearchEvent(request: SearchEventRequest): Promise<SearchEventResponse> {
        return this.sendEvent('search', request);
    }

    async sendClickEvent(request: ClickEventRequest): Promise<ClickEventResponse> {
        return this.sendEvent('click', request);
    }

    async sendCustomEvent(request: CustomEventRequest): Promise<CustomEventResponse> {
        return this.sendEvent('custom', request);
    }

    async sendViewEvent(request: ViewEventRequest): Promise<ViewEventResponse> {
        return this.sendEvent('view', request);
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
}

/** @deprecated Use CoveoAnalyticsClient instead. */
export const Client = CoveoAnalyticsClient;

export default CoveoAnalyticsClient;
