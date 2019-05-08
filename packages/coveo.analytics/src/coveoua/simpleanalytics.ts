import { AnyEventResponse, EventType } from '../events';
import {
    AnalyticsClient,
    CoveoAnalyticsClient,
    Endpoints,
} from '../client/analytics';

/** @deprecated */
export type DeprecatedEventType = 'pageview';

export type AvailableActions = keyof(CoveoUA);

// CoveoUA mimics the GoogleAnalytics API.
export class CoveoUA {
    private client?: AnalyticsClient;

    // init initializes a new SimpleAPI client.
    // @param token is your coveo access_token / api_key / ...
    // @param endpoint is the endpoint you want to target defaults to the
    //        usage analytics production endpoint
    init(token: string | AnalyticsClient, endpoint: string): void {
        if (!token) {
            throw new Error(`You must pass your token when you call 'init'`);
        }

        if (typeof token === 'string') {
            endpoint = endpoint || Endpoints.default;
            this.client = new CoveoAnalyticsClient({
                token: token,
                endpoint: endpoint
            });
        } else if (typeof token === 'object' && typeof token.sendEvent !== 'undefined') {
            this.client = token;
        } else {
            throw new Error(`You must pass either your token or a valid object when you call 'init'`);
        }
    }

    send(event: EventType | DeprecatedEventType, payload: any = {}): Promise<AnyEventResponse | void> {
        if (typeof this.client == 'undefined') {
            throw new Error(`You must call init before sending an event`);
        }

        if (event !== 'pageview') {
            return this.client.sendEvent(event, payload);
        } else {
            const {
                contentLanguage,
                contentIdKey,
                contentIdValue,
                contentType,
                anonymous,
                customData,
                ...payloadRest
            } = payload;

            return this.client.sendViewEvent({
                contentIdKey,
                contentIdValue,
                contentType,
                anonymous,
                customData: {
                    ...customData,
                    ...payloadRest
                }
            });
        }
    }

    onLoad(callback: Function) {
        if (typeof callback == 'undefined') {
            throw new Error(`You must pass a function when you call 'onLoad'`);
        }

        callback();
    }
}
/** @deprecated */
export const SimpleAPI = CoveoUA;

export const coveoua = new CoveoUA();

export const handleOneAnalyticsEvent = (action: string, ...params: any[]): any => {
    const actionFunction = (<any>coveoua)[action];
    if (actionFunction) {
        return actionFunction.apply(coveoua, params);
    } else {
        const actions: AvailableActions[] = ['init', 'send', 'onLoad'];
        throw new Error(`The action "${action}" does not exist. Available actions: ${actions.join(', ')}.`);
    }
};

/** @deprecated */
export const SimpleAnalytics = handleOneAnalyticsEvent;

export default handleOneAnalyticsEvent;
