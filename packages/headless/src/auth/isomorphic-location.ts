export interface IsomorphicLocation {
  href: string;
}

export function getIsomorphicLocation(): IsomorphicLocation {
  const isBrowser = typeof window !== 'undefined';
  return isBrowser ? location : {href: ''};
}
