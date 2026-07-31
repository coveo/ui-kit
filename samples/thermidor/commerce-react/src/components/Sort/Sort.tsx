import type {ChangeEvent} from 'react';
import {buildSortController} from '@coveo/thermidor';
import type {CommerceSortCriterion} from '@coveo/thermidor';
import {useCommerceInterface} from '../../context/commerce-interface.js';
import {useBuildController} from '../../hooks/use-build-controller.js';
import styles from './Sort.module.css';

const SORT_OPTIONS: {criterion: CommerceSortCriterion; label: string}[] = [
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

export function Sort() {
  const commerceInterface = useCommerceInterface();

  const [controller] = useBuildController(() =>
    buildSortController({interface: commerceInterface})
  );

  const selectedIndex = SORT_OPTIONS.findIndex((opt) => controller.isSortedBy(opt.criterion));

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value, 10);
    const option = SORT_OPTIONS[index];
    if (option) {
      controller.sortBy(option.criterion);
    }
  };

  return (
    <div className={styles.container}>
      <label className={styles.label} htmlFor="sort-select">
        Sort by
      </label>
      <select
        id="sort-select"
        className={styles.select}
        value={selectedIndex >= 0 ? String(selectedIndex) : '0'}
        onChange={handleChange}
      >
        {SORT_OPTIONS.map((option, index) => (
          <option key={index} value={String(index)}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
