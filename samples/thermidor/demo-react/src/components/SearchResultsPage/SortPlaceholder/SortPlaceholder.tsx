import type {SortController} from '@coveo/thermidor';
import {useCallback, useSyncExternalStore} from 'react';
import styles from './SortPlaceholder.module.css';

interface SortProps {
  controller: SortController;
}

export function SortPlaceholder({controller}: SortProps) {
  const subscribe = useCallback(
    (onStoreChange: () => void) => controller.subscribe(onStoreChange),
    [controller]
  );
  const getSnapshot = useCallback(() => controller.state, [controller]);
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const hasAvailableSorts = state.availableSorts.length > 0;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const criterion = state.availableSorts.find((s) => s.sortCriteria === e.target.value);
    if (criterion) {
      controller.sortBy(criterion);
    }
  };

  return (
    <div className={styles.container}>
      <label className={styles.label} htmlFor="sort-select">
        <strong>Sort by:</strong>
      </label>
      <select
        id="sort-select"
        className={styles.select}
        value={hasAvailableSorts ? (state.appliedSort?.sortCriteria ?? '') : 'relevance'}
        onChange={handleChange}
        disabled={!hasAvailableSorts}
      >
        {hasAvailableSorts ? (
          state.availableSorts.map((sort) => (
            <option key={sort.sortCriteria} value={sort.sortCriteria}>
              {formatSortLabel(sort.sortCriteria)}
            </option>
          ))
        ) : (
          <option value="relevance">Relevance</option>
        )}
      </select>
    </div>
  );
}

function formatSortLabel(sortCriteria: string): string {
  return sortCriteria
    .replace(/^@/, '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
