export interface IsomorphicLocation {
  href: string;
  hash: string;
}

export function getIsomorphicLocation(): IsomorphicLocation {
  const isBrowser = typeof window !== 'undefined';
  return isBrowser ? location : {href: '', hash: ''};
}
