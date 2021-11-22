export type IsomorphicHistory = Pick<History, 'replaceState'>;

export function getIsomorphicHistory(): IsomorphicHistory {
  const isBrowser = typeof window !== 'undefined';
  return isBrowser ? history : {replaceState: () => {}};
}
