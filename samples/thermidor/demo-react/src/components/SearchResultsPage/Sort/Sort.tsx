import type {CommerceSortCriterion, SearchSortCriterion, SortController} from '@coveo/thermidor';
import {useCallback, useSyncExternalStore} from 'react';
import styles from './Sort.module.css';

type AnyCriterion = SearchSortCriterion | CommerceSortCriterion;

const STATIC_OPTIONS: {criterion: AnyCriterion; label: string}[] = [
  {criterion: {by: 'relevance'}, label: 'Relevance'},
  {
    criterion: {by: 'field', field: 'ec_price', direction: 'ascending'},
    label: 'Price (Low to High)',
  },
  {
    criterion: {by: 'field', field: 'ec_price', direction: 'descending'},
    label: 'Price (High to Low)',
  },
];

interface SortProps {
  controller: SortController<any>;
}

export function Sort({controller}: SortProps) {
  const subscribe = useCallback(
    (onStoreChange: () => void) => controller.subscribe(onStoreChange),
    [controller]
  );
  const getSnapshot = useCallback(() => controller.state, [controller]);
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const selectedIndex = STATIC_OPTIONS.findIndex((opt) => controller.isSortedBy(opt.criterion));

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = Number(e.target.value);
    const option = STATIC_OPTIONS[index];
    if (option) {
      controller.sortBy(option.criterion);
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
        value={selectedIndex >= 0 ? String(selectedIndex) : '0'}
        onChange={handleChange}
      >
        {STATIC_OPTIONS.map((option, index) => (
          <option key={index} value={String(index)}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
