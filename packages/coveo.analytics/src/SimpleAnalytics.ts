import * as analytics from './analytics';
import objectAssign from './objectAssign';

// SimpleAPI mimics the GoogleAnalytics API.
class SimpleAPI {
    private client: analytics.Client;

    // init initializes a new SimpleAPI client.
    // @param token is your coveo access_token / api_key / ...
    // @param endpoint is the endpoint you want to target defaults to the
    //        usage analytics production endpoint
    init(token: string, endpoint: string = analytics.Endpoints.default ) {
        if (typeof token === 'undefined') {
            throw new Error(`You must pass your token when you call 'init'`);
        }

        this.client = new analytics.Client({
            token: token,
            endpoint: endpoint
        });
    }

    send(event: EventType, customData: any) {
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
                    language: navigator.language,
                    title: document.title,
                    customData: customData
                });
                return;
            default:
                throw new Error(`Event type: '${event}' not implemented`);
        }
    }
}

type EventType = 'pageview';

// simpleAPI singleton
const simpleAPI = new SimpleAPI();

export const SimpleAnalytics = (action: string, ...params: string[]) => {
  const actionFunction = (<any>simpleAPI)[action];
  if (actionFunction) {
    actionFunction.apply(simpleAPI, params);
  }
};

export default SimpleAnalytics;
