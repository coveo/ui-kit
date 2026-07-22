// This file is to prevent including a fetch polyfill from the "cross-fetch" dependency when building for a browser target.
// Major browsers today provide fetch on the window object, so including a polyfill would needlessly increase the size of the bundle.
export const fetch = globalThis.fetch;
