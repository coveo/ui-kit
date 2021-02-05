import {AnalyticsRequestClient, VisitorIdProvider} from './analyticsRequestClient';
import {AnyEventResponse, EventType, IRequestPayload} from '../events';

export type HttpMethods = 'POST' | 'GET' | 'PUT' | 'DELETE';

export interface IAnalyticsFetchClientCallOptions {
    url: string;
    headers: Record<string, string>;
    method: HttpMethods;
    mode: RequestMode;
    credentials: RequestCredentials;
    payload: Record<string, any>;
}

export type PreprocessRequestMiddleware = (
    request: IAnalyticsFetchClientCallOptions
) => IAnalyticsFetchClientCallOptions | Promise<IAnalyticsFetchClientCallOptions>;

export interface IAnalyticsFetchClientOptions {
    baseUrl: string;
    token?: string;
    visitorIdProvider: VisitorIdProvider;
    preprocessRequestMiddleware?: PreprocessRequestMiddleware;
}

export class AnalyticsFetchClient implements AnalyticsRequestClient {
    constructor(private opts: IAnalyticsFetchClientOptions) {}

    public async sendEvent(eventType: EventType, payload: IRequestPayload): Promise<AnyEventResponse> {
        const {baseUrl, visitorIdProvider, preprocessRequestMiddleware} = this.opts;

        const visitorIdParam = this.shouldAppendVisitorId(eventType) ? await this.getVisitorIdParam() : '';
        const fetchOptions: IAnalyticsFetchClientCallOptions = {
            url: `${baseUrl}/analytics/${eventType}${visitorIdParam}`,
            credentials: 'include',
            mode: 'cors',
            headers: this.getHeaders(),
            method: 'POST',
            payload,
        };
        const processedOptions: IAnalyticsFetchClientCallOptions = {
            ...fetchOptions,
            ...(preprocessRequestMiddleware ? await preprocessRequestMiddleware(fetchOptions) : {}),
        };

        const response = await fetch(processedOptions.url, {
            method: processedOptions.method,
            headers: processedOptions.headers,
            mode: processedOptions.mode,
            body: JSON.stringify(processedOptions.payload),
            credentials: processedOptions.credentials,
        });
        if (response.ok) {
            const visit = (await response.json()) as AnyEventResponse;

            if (visit.visitorId) {
                visitorIdProvider.setCurrentVisitorId(visit.visitorId);
            }

            return visit;
        } else {
            try {
                response.json();
            } catch {
                /* If you don't parse the response, it won't appear in the network tab. */
            }
            console.error(`An error has occured when sending the "${eventType}" event.`, response, payload);
            throw new Error(
                `An error has occurred when sending the "${eventType}" event. Check the console logs for more details.`
            );
        }
    }

    private shouldAppendVisitorId(eventType: EventType) {
        return [EventType.click, EventType.custom, EventType.search, EventType.view].indexOf(eventType) !== -1;
    }

    private async getVisitorIdParam() {
        const {visitorIdProvider} = this.opts;
        const visitorId = await visitorIdProvider.getCurrentVisitorId();
        return visitorId ? `?visitor=${visitorId}` : '';
    }

    private getHeaders(): Record<string, string> {
        const {token} = this.opts;
        return {
            ...(token ? {Authorization: `Bearer ${token}`} : {}),
            'Content-Type': `application/json`,
        };
    }
}
