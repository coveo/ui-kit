import * as analytics from './analytics';
import objectAssign from './objectAssign';

// SimpleAPI permits to mimic the GoogleAnalytics simple to call api, but we
// send events to Coveo usage analytics service usign thoses calls.
class SimpleAPI {
    private client: analytics.Client;
    private isInited: boolean = false;

    // init initializes a new SimpleAPI client.
    // @param token is your coveo access_token / api_key / ...
    // @param endpoint is the endpoint you want to target defaults to the
    //        usage analytics production endpoint
    init(token: string, endpoint: string = analytics.Endpoints.default ) {
        if (token === undefined) {
            throw new Error(`You must pass your token when you call 'init'`);
        }

        this.isInited = true;
        this.client = new analytics.Client({
            token: token,
            endpoint: endpoint
        });
    }

    send(event: string, customData: any) {
        if (!this.isInited) {
            console.error(`You must init before sending an event`);
            return;
        }

        customData = objectAssign({}, {
            hash: window.location.hash
        }, customData);

        switch (event) {
        case 'pageview':
            this.client.SendViewEvent({
                location: window.location.toString(),
                referrer: document.referrer,
                language: navigator.language,
                title: document.title,
                customData: customData
            });
            return;
        default:
            console.error(`Event type: '${event}' not implemented`);
            return;
        }
    }
}

// simpleAPI singleton
const simpleAPI = new SimpleAPI();

export const SimpleAnalytics = (action: string, ...params: string[]) => {
  const actionFunction = (<any>simpleAPI)[action];
  if (actionFunction) {
    actionFunction.apply(simpleAPI, params);
  }
};

export default SimpleAnalytics;
