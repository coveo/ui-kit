import {useId, useOptimistic} from 'react';
import {createComponentImplementation} from '@a2ui/react/v0_9';
import {SortPropsSchema, type SortAction, type SortCriterion} from '@coveo/thermidor-schema/zod3';
import {useGesture} from '../session-request.js';
import styles from './Sort.module.css';

// Relevance is built into the Commerce API and carries no label, not even in the merchant's
// configuration: the UI names it, as Atomic does. A field sort is named by its fields'
// displayName, localized by the Commerce API.
function sortLabel(sort: SortCriterion): string {
  if (sort.sortCriteria === 'relevance') {
    return 'Relevance';
  }
  return sort.fields.flatMap(({displayName}) => displayName ?? []).join(', ');
}

/** A2-UI component for the `sort` selector. */
export const Sort = createComponentImplementation(
  {name: 'Sort', schema: SortPropsSchema},
  // TODO(a2ui-react context): `context` is deprecated in @a2ui/react 0.16. Build this through
  // `view({node, buildChild})` (or a shared helper): props from `useNodeView`, and dispatch with
  // `useA2uiSurface()?.dispatchAction(action, node.componentId)`.
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
          event: {name: 'selectSort', context: {sort: selected}},
        };
        startGesture(
          () => addOptimisticSort(selected),
          () => context.dispatchAction(selectSortAction)
        );
      }
    };

    // The applied sort comes back as the available sort it matches, label included.
    const selectedIndex = appliedSort
      ? availableSorts.findIndex((sort) => JSON.stringify(sort) === JSON.stringify(appliedSort))
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
