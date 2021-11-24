export type BrowserHistory = Pick<History, 'replaceState'>;

export function getBrowserHistory(): BrowserHistory {
  const isBrowser = typeof window !== 'undefined';
  return isBrowser ? history : {replaceState: () => {}};
}
