export function createAbortController(): AbortController | null {
  // For nodejs environments only, we want to load the implementation of AbortController from node-abort-controller package.
  // For browser environments, we need to make sure that we don't use AbortController as it might not be available (Locker Service in Salesforce)
  // This is not something that can be polyfilled in a meaningful manner.
  // This is a low level browser API after all, and only JS code inside a polyfill cannot actually cancel network requests done by the browser.
  return typeof AbortController === 'undefined' ? null : new AbortController();
}
