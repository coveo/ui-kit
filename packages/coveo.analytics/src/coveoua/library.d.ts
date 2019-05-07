declare namespace CoveoAnalytics {
    interface Response {
    }

    interface SearchDocument {
        documentUri: string;
        documentUriHash: string;
    }

    interface EventBaseRequest {
        language?: string;
        userAgent?: string;
        customData?: any;
        anonymous?: boolean;
        username?: string;
        userDisplayName?: any;
        splitTestRunName?: string;
        splitTestRunVersion?: string;

        originLevel1?: string;
        originLevel2?: string;
        originLevel3?: string;
    }

    interface SearchEventRequest extends EventBaseRequest {
        searchQueryUid: string;
        queryText: string;
        actionCause: string;
        responseTime: number;
        advancedQuery?: string;
        numberOfResults?: number;
        contextual?: boolean;
        results?: SearchDocument[];
        queryPipeline?: string;
        userGroups?: string[];
    }

    interface ClickEventRequest extends EventBaseRequest {
        documentUri: string;
        documentUriHash: string;
        collectionName: string;
        sourceName: string;
        documentPosition: number;
        actionCause: string;

        searchQueryUid?: string;
        documentTitle?: string;
        documentUrl?: string;
        documentAuthor?: string;
        queryPipeline?: string;
        rankingModifier?: string;
    }

    interface CustomEventRequest extends EventBaseRequest {
        eventType: string;
        eventValue: string;
        lastSearchQueryUid?: string;
    }

    interface ViewEventRequest extends EventBaseRequest {
        location: string;
        referrer?: string;
        title?: string;
        contentIdKey?: string;
        contentIdValue?: string;
        contentType?: string;
    }

    interface DefaultEventResponse {
        visitId: string;
        visitorId: string;
    }

    interface SearchEventResponse extends DefaultEventResponse {
    }

    interface ClickEventResponse extends DefaultEventResponse {
    }

    interface CustomEventResponse extends DefaultEventResponse {
    }

    interface ViewEventResponse extends DefaultEventResponse {
    }

    type AnyEventResponse = SearchEventResponse | ClickEventResponse | CustomEventResponse | ViewEventResponse;

    interface VisitResponse {
        id: string;
        visitorId: string;
    }

    interface HealthResponse {
        status: string;
    }

    interface CoveoAnalyticsClient {
        sendEvent(eventType: string, request: any): Promise<Response>;
        sendSearchEvent(request: SearchEventRequest): Promise<SearchEventResponse>;
        sendClickEvent(request: ClickEventRequest): Promise<ClickEventResponse>;
        sendCustomEvent(request: CustomEventRequest): Promise<CustomEventResponse>;
        sendViewEvent(request: ViewEventRequest): Promise<ViewEventResponse>;
        getVisit(): Promise<VisitResponse>;
        getHealth(): Promise<HealthResponse>;
    }

    type Client = CoveoAnalyticsClient;

    class HistoryStore {
        constructor();
        addElement(elem: HistoryElement): void;
        getHistory(): HistoryElement[];
        setHistory(history: HistoryElement[]): void;
        clear(): void;
    }

    interface History {
        HistoryStore: {
            new(): HistoryStore;
        };
    }

    type HistoryElement = HistoryViewElement | HistoryQueryElement | any;
    interface HistoryViewElement {
        type: string;
        uri: string;
        title?: string;
    }

    interface HistoryQueryElement {
        name: string;
        value: string;
        time: string;
    }

    interface AnalyticsClient {
        Client: Client;
    }

    type DeprecatedEventType = 'pageview';
    class CoveoUA {
        init(token: string | AnalyticsClient, endpoint: string): void;
        send(event: EventType | DeprecatedEventType, payload: any): Promise<AnyEventResponse>;
        onLoad(callback: Function): void;
    }
    const SimpleAPI: typeof CoveoUA;
    const coveoua: CoveoUA;

    type EventType = 'search' | 'click' | 'custom' | 'view';
}

declare module 'coveo.analytics' {
    export const analytics: CoveoAnalytics.AnalyticsClient;
    export const history: CoveoAnalytics.History;
    export const CoveoAnalyticsClient: CoveoAnalytics.CoveoAnalyticsClient;
    export const CoveoUA: CoveoAnalytics.CoveoUA
    export const handleOneAnalyticsEvent:  (action: string, ...params: any[]) => any;
    export const SimpleAnalytics: {
        /** @deprecated */
        SimpleAPI: CoveoAnalytics.CoveoUA,
        /** @deprecated */
        SimpleAnalytics: (action: string, ...params: any[]) => any;
    };
}
