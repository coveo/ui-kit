/**
 * An integration test for every function that sends an event. The test's goal is to see if the event is sent with the same parameter in 'next' mode and 'legacy' mode.
 */
import {SearchEngineOptions} from './search-engine';

describe('s', () => {
  it('searchEngine', () => {
    let optionsNext: SearchEngineOptions;
    optionsNext.configuration.analytics = {
      analyticsMode: 'next',
      trackingId: 'foo',
    };
    // check with next,
    // register value
    // check with legacy
    // compare
  });
});
