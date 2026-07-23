export type IRequestPayload = Record<string, any>;

export enum EventType {
    search = 'search',
    click = 'click',
    custom = 'custom',
    view = 'view',
    collect = 'collect',
}

export interface SearchDocument {
    documentUri: string;
    documentUriHash: string;
}

export type SendEventArguments = [EventType, ...any[]];

export type VariableArgumentsPayload =
    | []
    | [any]
    | [string, any]
    | [string, string, any]
    | [string, string, string, any]
    | [string, string, string, string, any];

export interface EventBaseRequest {
    language?: string;
    userAgent?: string;
    customData?: Record<string, any>;
    anonymous?: boolean;
    username?: string;
    userDisplayName?: any;
    splitTestRunName?: string;
    splitTestRunVersion?: string;
    clientId?: string;
    originContext?: string;
    originLevel1?: string;
    originLevel2?: string;
    originLevel3?: string;
}

export interface FacetStateRequest {
    field: string;
    id: string;
    value: string;
    valuePosition: number;
    displayValue: string;
    facetType: 'specific' | 'dateRange' | 'numericalRange' | 'hierarchical';
    state: 'selected' | 'idle' | 'excluded';
    facetPosition: number;
    title: string;
    start?: string;
    end?: string;
    endInclusive?: boolean;
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
    facetState?: FacetStateRequest[];
}

export interface PreparedSearchEventRequest extends Omit<SearchEventRequest, 'searchQueryUid'> {}

export interface DocumentInformation {
    documentUri?: string;
    documentUriHash: string;
    collectionName?: string;
    sourceName: string;
    documentPosition: number;
    actionCause: string;

    searchQueryUid: string;
    documentTitle?: string;
    documentUrl?: string;
    documentAuthor?: string;
    queryPipeline?: string;
    rankingModifier?: string;
}

export interface ClickEventRequest extends EventBaseRequest, DocumentInformation {}

export interface PreparedClickEventRequest extends Omit<ClickEventRequest, 'searchQueryUid'> {}

export interface CustomEventRequest extends EventBaseRequest {
    eventType: string;
    eventValue: string;
    lastSearchQueryUid?: string;
}

export interface PreparedCustomEventRequest extends Omit<CustomEventRequest, 'lastSearchQueryUid'> {}

export interface ViewEventRequest extends EventBaseRequest {
    location?: string;
    referrer?: string;
    title?: string;
    contentIdKey: string;
    contentIdValue: string;
    contentType?: string;
}

export interface PreparedViewEventRequest extends ViewEventRequest {}

export interface DefaultEventResponse {
    visitId: string;
    visitorId: string;
}

export interface SearchEventResponse extends DefaultEventResponse {}
export interface ClickEventResponse extends DefaultEventResponse {}
export interface CustomEventResponse extends DefaultEventResponse {}
export interface ViewEventResponse extends DefaultEventResponse {}

export type AnyEventResponse = SearchEventResponse | ClickEventResponse | CustomEventResponse | ViewEventResponse;

export interface VisitResponse {
    id: string;
    visitorId: string;
}
export interface HealthResponse {
    status: string;
}
