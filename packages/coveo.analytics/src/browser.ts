import SimpleAnalytics from './SimpleAnalytics';
import * as analytics from './index';
import { HistoryStore } from './history';

declare const global: any;

// CoveoUAGlobal is the interface for the global function which also has a
// queue `q` of unexecuted parameters
export interface CoveoUAGlobal {
    (action: string, ...params: Array<string>): void;
    // CoveoAnalytics.q ; // is the queue of last called actions before lib was included
    q?: Array<Array<string>>;
    disableAutoHistory: boolean;
}

// On load of this script we get the global object `coveoua` (which would be)
// on `window` in a browser
const coveoua: CoveoUAGlobal = global.coveoua || {};

// On normal execution this library should be loaded after the snippet execution
// so we will execute the actions in the `q` array
if (coveoua.q) {
  coveoua.q.forEach( (args: Array<string>) => {
    const [ action, ...params ] = args;
    SimpleAnalytics(action, ...params);
  });
}

const doNotTrack = [true, 'yes', '1'].indexOf( (<any>navigator).doNotTrack || (<any>navigator).msDoNotTrack || (<any>window).doNotTrack);

// I don't know if doNotTrack applies here since the data is stored in the browser
// but it is send to an api afterwards to get relevancy results.
if (!coveoua.disableAutoHistory && !doNotTrack) {
    const store = new HistoryStore();
    store.addElement({
        type: 'view',
        uri: document.location.toString(),
        title: document.title
    });
}

// Replace the quick shim with the real thing.
global.coveoua = SimpleAnalytics;
//
global.coveoanalytics = analytics;

export default coveoua;
