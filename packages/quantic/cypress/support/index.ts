import './commands';

Cypress.on('uncaught:exception', (err) => {
  if (
    err.message.includes(
      'navigator.sendBeacon is not supported in this browser.'
    )
  ) {
    // This error happens when the browser switch pages before the analytics
    // event buffer could be flushed. This error won't happen for any test
    // that validates the UA requests (because the test would wait for the
    // UA event to complete).
    return false;
  }
});
