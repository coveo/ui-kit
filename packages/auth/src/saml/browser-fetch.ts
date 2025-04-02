export type BrowserFetch = typeof fetch;

export function getBrowserFetch(): BrowserFetch {
  const isBrowser = typeof window !== 'undefined';
  return isBrowser ? fetch : () => Promise.resolve(new Response());
}
