import SimpleAnalytics from './simpleanalytics';
import * as analytics from './index';
import { HistoryStore } from './history';

declare const global: any;

// CoveoUAGlobal is the interface for the global function which also has a
// queue `q` of unexecuted parameters
export interface CoveoUAGlobal {
    (action: string, ...params: string[]): void;
    // CoveoAnalytics.q is the queue of last called actions before lib was included
    q?: string[][];
    disableAutoHistory: boolean;
}

// On load of this script we get the global object `coveoua` (which would be)
// on `window` in a browser
const coveoua: CoveoUAGlobal = global.coveoua || {};

// On normal execution this library should be loaded after the snippet execution
// so we will execute the actions in the `q` array
if (coveoua.q) {
  coveoua.q.forEach( (args: Array<string>) => SimpleAnalytics.apply(void 0, args));
}

// According to the Mozilla Do Not Track Field Guide
// (https://developer.mozilla.org/en-US/docs/Web/Security/Do_not_track_field_guide),
// gathering data of actions of an user as long as it is not associated to the
// identity of that user, doNotTrack is not enabled here.
if (!coveoua.disableAutoHistory) {
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
