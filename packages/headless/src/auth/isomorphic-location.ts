export type IsomorphicLocation = Pick<Location, 'href' | 'hash'>;

export function getIsomorphicLocation(): IsomorphicLocation {
  const isBrowser = typeof window !== 'undefined';
  return isBrowser ? location : {href: '', hash: ''};
}
