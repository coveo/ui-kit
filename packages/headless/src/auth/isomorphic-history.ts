export interface IsomorphicHistory {
  replaceState(
    data: any,
    unused: string,
    url?: string | null | undefined
  ): void;
}

export function getIsomorphicHistory(): IsomorphicHistory {
  const isBrowser = typeof window !== 'undefined';
  return isBrowser ? history : {replaceState: () => {}};
}
