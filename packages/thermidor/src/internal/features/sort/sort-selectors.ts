import {type CacheKey, createCacheKey} from '@/src/internal/utils/index.js';
import {getHandleInternals} from '@/src/internal/utils/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import {createMemoizedStateSelector} from '@/src/internal/utils/index.js';
import {createSelectSlice} from '@/src/internal/utils/index.js';
import {initialSortState} from './sort-slice.js';
import type {SortState} from './sort-slice.js';
import type {CommerceSortCriterion, SearchSortCriterion} from './sort-types.js';
import {toSearchApiCompoundSort} from './sort-translate.js';
import type {CommerceApiSortPayload} from './sort-translate.js';

type SortSelectors = ReturnType<typeof createSortSelectors>;

const CACHE_KEY: CacheKey<SortSelectors> = createCacheKey<SortSelectors>('sort/selectors');

export function createSortSelectors(interfaceId: string) {
  const sliceSelector = createSelectSlice(interfaceId, 'sort', initialSortState);

  return {
    getAppliedSort: createMemoizedStateSelector(
      sliceSelector,
      (state: SortState) => state.appliedSort
    ),
    getAvailableSorts: createMemoizedStateSelector(
      sliceSelector,
      (state: SortState) => state.availableSorts
    ),
    buildSortRequest: createMemoizedStateSelector(
      sliceSelector,
      (state: SortState): CommerceApiSortPayload | undefined => {
        if (!state.appliedSort) {
          return undefined;
        }
        const criteria = Array.isArray(state.appliedSort) ? state.appliedSort : [state.appliedSort];

        if (criteria.length === 0) {
          return undefined;
        }

        const hasRelevance = criteria.some((c) => c.by === 'relevance');
        if (hasRelevance) {
          return {sortCriteria: 'relevance'};
        }

        const fields: CommerceApiSortPayload['fields'] = criteria
          .filter((c): c is CommerceSortCriterion & {by: 'field'} => c.by === 'field')
          .map((c) => ({
            field: c.field,
            direction: (c.direction === 'ascending' ? 'asc' : 'desc') as 'asc' | 'desc',
            ...(c.displayName ? {displayName: c.displayName} : {}),
          }));

        return {sortCriteria: 'fields', fields};
      }
    ),
    buildSearchSortCriteria: createMemoizedStateSelector(
      sliceSelector,
      (state: SortState): string | undefined => {
        if (!state.appliedSort) {
          return undefined;
        }
        const criteria = Array.isArray(state.appliedSort) ? state.appliedSort : [state.appliedSort];
        return toSearchApiCompoundSort(criteria as SearchSortCriterion[]);
      }
    ),
  };
}

export function getOrCreateSortSelectors(iface: InterfaceHandle) {
  const {stateId, cacheRegistry} = getHandleInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () => createSortSelectors(stateId));
}
