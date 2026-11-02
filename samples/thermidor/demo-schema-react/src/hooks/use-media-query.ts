import {useCallback, useMemo, useSyncExternalStore} from 'react';

/** Whether the viewport matches the CSS media `query`, following it as the viewport changes. */
export function useMediaQuery(query: string): boolean {
  const list = useMemo(() => window.matchMedia(query), [query]);
  const subscribe = useCallback(
    (onChange: () => void) => {
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    [list]
  );
  return useSyncExternalStore(
    subscribe,
    () => list.matches,
    () => false
  );
}
