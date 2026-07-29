import {buildSortController} from '@coveo/thermidor';
import type {SearchSortCriterion} from '@coveo/thermidor';
import {useSearchInterface} from '../../context/search-interface.js';
import {useBuildController} from '../../hooks/use-build-controller.js';
import styles from './Sort.module.css';

const SORT_OPTIONS: {criterion: SearchSortCriterion; label: string}[] = [
  {criterion: {by: 'relevance'}, label: 'Relevance'},
  {criterion: {by: 'date', direction: 'descending'}, label: 'Date (Newest)'},
  {criterion: {by: 'date', direction: 'ascending'}, label: 'Date (Oldest)'},
];

export function Sort() {
  const searchInterface = useSearchInterface();

  const [controller] = useBuildController(() => buildSortController({interface: searchInterface}));

  const selectedIndex = SORT_OPTIONS.findIndex((opt) =>
    controller.isSortedBy(opt.criterion as Parameters<typeof controller.isSortedBy>[0])
  );

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = parseInt(e.target.value, 10);
    const option = SORT_OPTIONS[index];
    if (option) {
      controller.sortBy(option.criterion as Parameters<typeof controller.sortBy>[0]);
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
