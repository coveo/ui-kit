import {useEffect, useMemo, useRef} from 'react';

/** Calls `callback` once `delay` ms have passed without a new call. `cancel()` drops a pending call. */
export function useDebouncedCallback<T extends unknown[]>(
  callback: (...args: T) => void,
  delay: number
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const debounced = useMemo(() => {
    const run = (...args: T) => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => callbackRef.current(...args), delay);
    };
    run.cancel = () => clearTimeout(timerRef.current);
    return run;
  }, [delay]);

  useEffect(() => debounced.cancel, [debounced]);

  return debounced;
}
