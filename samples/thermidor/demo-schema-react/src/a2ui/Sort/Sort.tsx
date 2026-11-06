import {useId, useOptimistic} from 'react';
import {createReactComponent} from '@copilotkit/a2ui-renderer';
import type {SortAction, SortCriterion} from '@coveo/thermidor-schema';
import {SortPropsSchema} from '@coveo/thermidor-schema/zod3';
import {useGesture} from '../session-request.js';
import styles from './Sort.module.css';

// Relevance is built into the Commerce API and carries no label, not even in the merchant's
// configuration: the UI names it, as Atomic does. A field sort is named by its fields'
// displayName, localized by the Commerce API.
function sortLabel({sortCriteria, fields}: SortCriterion): string {
  if (sortCriteria === 'relevance') {
    return 'Relevance';
  }
  return fields.flatMap(({displayName}) => displayName ?? []).join(', ');
}

/** A2-UI component for the `sort` selector. */
export const Sort = createReactComponent(
  {name: 'Sort', schema: SortPropsSchema},
  ({props, context}) => {
    const selectId = useId();
    const availableSorts = props.availableSorts ?? [];

    const [appliedSort, addOptimisticSort] = useOptimistic(props.appliedSort);
    const startGesture = useGesture();

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
        startGesture(
          () => addOptimisticSort({sortCriteria: selected.sortCriteria, fields: selected.fields}),
          () => context.dispatchAction(selectSortAction)
        );
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
              {sortLabel(sort)}
            </option>
          ))}
        </select>
      </div>
    );
  }
);
