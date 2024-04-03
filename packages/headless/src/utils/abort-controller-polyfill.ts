export function createAbortController(): AbortController | null {
  // For nodejs environments only, we want to load the implementation of AbortController from node-abort-controller package.
  // For browser environments, we need to make sure that we don't use AbortController as it might not be available (Locker Service in Salesforce)
  // This is not something that can be polyfilled in a meaningful manner.
  // This is a low level browser API after all, and only JS code inside a polyfill cannot actually cancel network requests done by the browser.

  if (typeof window === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const {AbortController: nodeAbort} = require('node-abort-controller');
    return new nodeAbort() as AbortController;
  }
  return typeof AbortController === 'undefined' ||
    // @ts-ignore
    window.AbortControllerPolyfillIsUsed
    ? null
    : new AbortController();
}
