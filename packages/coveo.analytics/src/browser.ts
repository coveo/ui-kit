import SimpleAnalytics from './SimpleAnalytics';
import * as analytics from './index';

declare const global: any;

// CoveoUAGlobal is the interface for the global function which also has a
// queue `q` of unexecuted parameters
export interface CoveoUAGlobal {
  (action: string, ...params: Array<string>): void;
  // CoveoAnalytics.q ; // is the queue of last called actions before lib was included
  q?: Array<Array<string>>;
}

// On load of this script we get the global object `coveoua` (which would be)
// on `window` in a browser
const coveoua: CoveoUAGlobal = global.coveoua;

// On normal execution this library should be loaded after the snippet execution
// so we will execute the actions in the `q` array
if (coveoua && coveoua.q) {
  coveoua.q.forEach( (args: Array<string>) => {
    const [ action, ...params ] = args;
    SimpleAnalytics(action, ...params);
  });
}

// Replace the quick shim with the real thing.
global.coveoua = SimpleAnalytics;
//
global.coveoanalytics = analytics;

export default coveoua;
