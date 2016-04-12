
export const Endpoints = {
  default: 'https://usageanalytics.coveo.com/rest/v15',
  production: 'https://usageanalytics.coveo.com/rest/v15',
  dev: 'https://usageanalyticsdev.coveo.com/rest/v15',
  staging: 'https://usageanalyticsstaging.coveo.com/rest/v15'
};

export interface ClientOptions {
  token: string;
  endpoint?: string;
};

export class Client {
    private endpoint: string;
    private token: string;

    constructor(opts: ClientOptions = {token: ''} ) {
        this.endpoint = opts.endpoint || Endpoints.default;
        this.token = opts.token;
    }

    SendSearchEvent(request: SearchEventRequest): Promise<SearchEventResponse> {
        return fetch(this.endpoint + '/analytics/search', {
                method: 'POST',
                headers: {authorization: `BEARER ${this.token}`},
                mode: 'cors',
                body: JSON.stringify(request)
            }).then((response) => {
            return response.json().then((data) => {
                return {
                    raw: response,
                    visitId: data['visitId'],
                    visitorId: data['visitorId']
                };
            });
        });
    }
    SendClickEvent(request: ClickEventRequest): Promise<ClickEventResponse> {
        return fetch(this.endpoint + '/analytics/click', {
                method: 'POST',
                headers: {authorization: `BEARER ${this.token}`},
                mode: 'cors',
                body: JSON.stringify(request)
            }).then((response) => {
            return response.json().then((data) => {
                return {
                    raw: response,
                    visitId: data['visitId'],
                    visitorId: data['visitorId']
                };
            });
        });
    }
    SendCustomEvent(request: CustomEventRequest): Promise<CustomEventResponse> {
        return fetch(this.endpoint + '/analytics/custom', {
                method: 'POST',
                headers: {authorization: `BEARER ${this.token}`},
                mode: 'cors',
                body: JSON.stringify(request)
            }).then((response) => {
            return response.json().then((data) => {
                return {
                    raw: response,
                    visitId: data['visitId'],
                    visitorId: data['visitorId']
                };
            });
        });
    }
    SendViewEvent(request: ViewEventRequest): Promise<ViewEventResponse> {
        return fetch(this.endpoint + '/analytics/view', {
                method: 'POST',
                headers: {authorization: `BEARER ${this.token}`},
                mode: 'cors',
                body: JSON.stringify(request)
            }).then((response) => {
            return response.json().then((data) => {
                return {
                    raw: response,
                    visitId: data['visitId'],
                    visitorId: data['visitorId']
                };
            });
        });
    }
    GetVisit(): Promise<VisitResponse> {
        return fetch(this.endpoint + '/analytics/visit').then((response) => {
            return response.json().then((data) => {
                return {
                    raw: response,
                    id: data['id'],
                    visitorId: data['id'],
                };
            });
        });
    }
    GetHealth(): Promise<HealthResponse> {
        return fetch(this.endpoint + '/analytics/monitoring/health').then((response) => {
            return response.json().then((data) => {
                return {
                    raw: response,
                    status: data['status']
                };
            });
        });
    }
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

export interface SearchDocument {
    documentUri: string;
    documentUriHash: string;
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
}

export interface DefaultEventResponse {
    raw: IResponse;
    visitId: string;
    visitorId: string;
}

export interface SearchEventResponse extends DefaultEventResponse {}
export interface ClickEventResponse extends DefaultEventResponse {}
export interface CustomEventResponse extends DefaultEventResponse {}
export interface ViewEventResponse extends DefaultEventResponse {}

export interface VisitResponse {
    raw: IResponse;
    id: string;
    visitorId: string;
}
export interface HealthResponse {
    raw: IResponse;
    status: string;
}

export default Client;
