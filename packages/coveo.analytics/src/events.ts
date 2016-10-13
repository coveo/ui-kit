import 'whatwg-fetch';

export interface SearchDocument {
    documentUri: string;
    documentUriHash: string;
}

export interface EventBaseRequest {
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

export interface SearchEventRequest extends EventBaseRequest {
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

export interface ClickEventRequest extends EventBaseRequest {
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

export interface CustomEventRequest extends EventBaseRequest {
    eventType: string;
    eventValue: string;
    lastSearchQueryUid?: string;
}

export interface ViewEventRequest extends EventBaseRequest {
    location: string;
    referrer?: string;
    title?: string;
    contentIdKey?: string;
    contentIdValue?: string;
    contentType?: string;
}

export interface DefaultEventResponse {
    raw: Response;
    visitId: string;
    visitorId: string;
}

export interface SearchEventResponse extends DefaultEventResponse {}
export interface ClickEventResponse extends DefaultEventResponse {}
export interface CustomEventResponse extends DefaultEventResponse {}
export interface ViewEventResponse extends DefaultEventResponse {}

export interface VisitResponse {
    raw: Response;
    id: string;
    visitorId: string;
}
export interface HealthResponse {
    raw: Response;
    status: string;
}
