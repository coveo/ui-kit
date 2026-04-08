import {memoize} from '@/src/utils/memoize';

const memoizedFetchIcon = memoize(fetch, (url: string) => url);

export const fetchIcon = memoizedFetchIcon.fn;

export function clearIconCache() {
  memoizedFetchIcon.clearCache();
}
