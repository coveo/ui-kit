import {useId} from 'react';
import {createReactComponent} from '@copilotkit/a2ui-renderer';
import type {SortAction} from '@coveo/thermidor-schema';
import {SortPropsSchema} from '@coveo/thermidor-schema/zod3';
import {useOptimisticValue} from '../use-optimistic-value.js';
import styles from './Sort.module.css';

const SORT_LABELS: Record<string, string> = {
  relevance: 'Relevance',
  price_asc: 'Price (Low to High)',
  price_desc: 'Price (High to Low)',
};

/** A2-UI component for the `sort` selector. */
export const Sort = createReactComponent(
  {name: 'Sort', schema: SortPropsSchema},
  ({props, context}) => {
    const selectId = useId();
    const availableSorts = props.availableSorts ?? [];

    const {value: appliedSort, dispatchOptimistic} = useOptimisticValue(
      props.appliedSort,
      (action: SortAction) => {
        context.dispatchAction(action);
      }
    );

    const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedIndex = Number(event.target.value);
      const selected = availableSorts[selectedIndex];
      if (selected) {
        const selectSortAction: SortAction = {
          event: {
            name: 'selectSort',
            context: {sortCriteria: selected.sortCriteria, fields: selected.fields},
          },
        };
        dispatchOptimistic({
          action: selectSortAction,
          next: () => ({sortCriteria: selected.sortCriteria, fields: selected.fields}),
          coalesce: 'absolute',
          invalidates: ['results'],
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
);
