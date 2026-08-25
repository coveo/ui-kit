import {useRemoteController} from '../controllers.js';
import {useStateSource} from '../state-source-context.js';
import type {SortProps} from '@coveo/thermidor-schema';
import styles from './Sort.module.css';

const SORT_LABELS: Record<string, string> = {
  relevance: 'Relevance',
  price_asc: 'Price (Low to High)',
  price_desc: 'Price (High to Low)',
};

export function SortRenderer({props}: {props: SortProps}) {
  const stateSource = useStateSource();
  const controller = useRemoteController(stateSource, props.componentId, props.componentType);

  if (!controller.state) {
    return null;
  }

  const {appliedSort, availableSorts} = controller.state;

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = Number(event.target.value);
    const selected = availableSorts[selectedIndex];
    if (selected) {
      controller.dispatch('setSort', {
        sortCriteria: selected.sortCriteria,
        fields: selected.fields,
      });
    }
  };

  const selectedIndex = availableSorts.findIndex(
    (sort) =>
      sort.sortCriteria === appliedSort.sortCriteria &&
      JSON.stringify(sort.fields) === JSON.stringify(appliedSort.fields)
  );

  return (
    <div className={styles.container}>
      <label className={styles.label} htmlFor={`sort-select-${props.componentId}`}>
        <strong>Sort by:</strong>
      </label>
      <select
        id={`sort-select-${props.componentId}`}
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
