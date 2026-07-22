import {AnalyticsRequestClient, IAnalyticsRequestOptions, IAnalyticsClientOptions} from './analyticsRequestClient';
import {AnyEventResponse, EventType, IRequestPayload} from '../events';
import {fetch} from 'cross-fetch';

export class AnalyticsFetchClient implements AnalyticsRequestClient {
    constructor(private opts: IAnalyticsClientOptions) {}

    public async sendEvent(eventType: EventType, payload: IRequestPayload): Promise<AnyEventResponse | void> {
        const {baseUrl, visitorIdProvider, preprocessRequest} = this.opts;

        const visitorIdParam = this.shouldAppendVisitorId(eventType) ? await this.getVisitorIdParam() : '';
        const defaultOptions: IAnalyticsRequestOptions = {
            url: `${baseUrl}/analytics/${eventType}${visitorIdParam}`,
            credentials: 'include',
            mode: 'cors',
            headers: this.getHeaders(),
            method: 'POST',
            body: JSON.stringify(payload),
        };
        const {url, ...fetchData}: IAnalyticsRequestOptions = {
            ...defaultOptions,
            ...(preprocessRequest ? await preprocessRequest(defaultOptions, 'analyticsFetch') : {}),
        };

        let response: Response;

        try {
            response = await fetch(url, fetchData);
        } catch (error) {
            console.error('An error has occured when sending the event.', error);
            return;
        }

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

    public async deleteHttpCookieVisitorId() {
        const {baseUrl} = this.opts;
        const url = `${baseUrl}/analytics/visit`;
        await fetch(url, {headers: this.getHeaders(), method: 'DELETE'});
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
