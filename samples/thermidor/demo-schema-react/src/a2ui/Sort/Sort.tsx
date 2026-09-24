import {useId} from 'react';
import type {SortProps, SortAction} from '@coveo/thermidor-schema/zod3';
import type {TypedRendererProps} from '../renderer-props.js';
import styles from './Sort.module.css';

const SORT_LABELS: Record<string, string> = {
  relevance: 'Relevance',
  price_asc: 'Price (Low to High)',
  price_desc: 'Price (High to Low)',
};

export function SortRenderer({props, dispatch}: TypedRendererProps<SortProps, SortAction>) {
  const selectId = useId();
  const availableSorts = props.availableSorts ?? [];
  const appliedSort = props.appliedSort;

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = Number(event.target.value);
    const selected = availableSorts[selectedIndex];
    if (selected) {
      dispatch?.({
        event: {
          name: 'selectSort',
          context: {sortCriteria: selected.sortCriteria, fields: selected.fields},
        },
      });
    }
  };

  const selectedIndex = appliedSort
    ? availableSorts.findIndex(
        (sort) =>
          sort.sortCriteria === appliedSort.sortCriteria &&
          JSON.stringify(sort.fields) === JSON.stringify(appliedSort.fields)
      )
    : -1;

  return (
    <div className={styles.container}>
      <label className={styles.label} htmlFor={selectId}>
        <strong>Sort by:</strong>
      </label>
      <select
        id={selectId}
        className={styles.select}
        value={selectedIndex >= 0 ? selectedIndex : 0}
        onChange={handleSortChange}
      >
        {availableSorts.map((sort, index) => (
          <option key={index} value={index}>
            {SORT_LABELS[sort.sortCriteria] ?? sort.sortCriteria}
          </option>
        ))}
      </select>
    </div>
  );
}
