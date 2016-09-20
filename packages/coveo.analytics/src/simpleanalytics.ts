import AnalyticsClient from './analyticsclient';
import * as analytics from './analytics';
import objectAssign from './objectassign';
import {popFromObject} from './utils';

// SimpleAPI mimics the GoogleAnalytics API.
export class SimpleAPI {
    private client: AnalyticsClient;

    // init initializes a new SimpleAPI client.
    // @param token is your coveo access_token / api_key / ...
    // @param endpoint is the endpoint you want to target defaults to the
    //        usage analytics production endpoint
    init(token: string | AnalyticsClient, endpoint: string): void {
        if (typeof token === 'undefined') {
            throw new Error(`You must pass your token when you call 'init'`);
        }
        if (typeof token === 'string') {
            endpoint = endpoint || analytics.Endpoints.default;
            this.client = new analytics.Client({
                token: token,
                endpoint: endpoint
            });
        } else if (typeof token === 'object' && typeof token.sendEvent !== 'undefined') {
            this.client = token;
        } else {
            throw new Error(`You must pass either your token or a valid object when you call 'init'`);
        }
    }

    send(event: EventType, customData: any): void {
        if (typeof this.client == 'undefined') {
            throw new Error(`You must call init before sending an event`);
        }

        customData = objectAssign({}, {
            hash: window.location.hash
        }, customData);

        switch (event) {
            case 'pageview':
                this.client.sendViewEvent({
                    location: window.location.toString(),
                    referrer: document.referrer,
                    language: document.documentElement.lang,
                    title: document.title,
                    contentIdKey: popFromObject(customData, 'contentIdKey'),
                    contentIdValue: popFromObject(customData, 'contentIdValue'),
                    contentType: popFromObject(customData, 'contentType'),
                    customData: customData
                });
                return;
            default:
                throw new Error(`Event type: '${event}' not implemented`);
        }
    }

    onLoad(callback: Function) {
        if (typeof callback == 'undefined') {
            throw new Error(`You must pass a function when you call 'onLoad'`);
        }

        callback();
    }
}

export type EventType = 'pageview';

// simpleAPI singleton
const simpleAPI = new SimpleAPI();

export const SimpleAnalytics = (action: string, ...params: any[]): any => {
  const actionFunction = (<any>simpleAPI)[action];
  if (actionFunction) {
    return actionFunction.apply(simpleAPI, params);
  }
};

export default SimpleAnalytics;
