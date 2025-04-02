export type BrowserLocation = Pick<Location, 'href' | 'hash'>;

export function getBrowserLocation(): BrowserLocation {
  const isBrowser = typeof window !== 'undefined';
  return isBrowser ? location : {href: '', hash: ''};
}
