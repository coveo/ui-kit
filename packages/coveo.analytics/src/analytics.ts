export const Version = 'v15';

export const Endpoints = {
  default: 'https://usageanalytics.coveo.com/rest/' + Version,
  production: 'https://usageanalytics.coveo.com/rest/' + Version,
  dev: 'https://usageanalyticsdev.coveo.com/rest/' + Version,
  staging: 'https://usageanalyticsstaging.coveo.com/rest/' + Version
};

export interface ClientOptions {
  token: string;
  endpoint?: string;
};

function defaultResponseTransformer(response: IResponse): Promise<any> {
    return response.json().then((data: any) => {
        data.raw = response;
        return data;
    });
}

export class Client {
    private endpoint: string;
    private token: string;

    constructor(opts: ClientOptions) {
        if (typeof opts === 'undefined') {
            throw new Error('You have to pass options to this constructor');
        }
        if (typeof opts.token === 'undefined') {
            throw new Error('You have to pass opts.token');
        }

        this.endpoint = opts.endpoint || Endpoints.default;
        this.token = opts.token;
    }

    sendEvent( eventType: string, request: any): Promise<IResponse> {
        return fetch(`${this.endpoint}/analytics/${eventType}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.token}`,
                'content-type' : 'application/json'},
            mode: 'cors',
            body: JSON.stringify(request)
        });
    }

    sendSearchEvent(request: SearchEventRequest): Promise<SearchEventResponse> {
        return this.sendEvent('search', request).then(defaultResponseTransformer);
    }
    sendClickEvent(request: ClickEventRequest): Promise<ClickEventResponse> {
        return this.sendEvent('click', request).then(defaultResponseTransformer);
    }
    sendCustomEvent(request: CustomEventRequest): Promise<CustomEventResponse> {
        return this.sendEvent('custom', request).then(defaultResponseTransformer);
    }
    sendViewEvent(request: ViewEventRequest): Promise<ViewEventResponse> {
        if (request.referrer === '') { delete request.referrer; }
        return this.sendEvent('view', request).then(defaultResponseTransformer);
    }
    getVisit(): Promise<VisitResponse> {
        return fetch(this.endpoint + '/analytics/visit')
            .then(defaultResponseTransformer);
    }
    getHealth(): Promise<HealthResponse> {
        return fetch(this.endpoint + '/analytics/monitoring/health')
            .then(defaultResponseTransformer);
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
