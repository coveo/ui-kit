import {useId} from 'react';
import type {PageSizeProps, PageSizeAction} from '@coveo/thermidor-schema';
import type {TypedRendererProps} from '../renderer-props.js';
import styles from './PageSize.module.css';

const DEFAULT_PAGE_SIZE_OPTIONS = [12, 24, 48];

/**
 * A2-UI renderer for the `page-size` component: a "Products per page" selector.
 *
 * It reads the current page size from its resolved props (bound to the A2-UI data model)
 * and dispatches `setPageSize` as a standard A2-UI action. The backend applies the change
 * to the surface's paging so the sibling pagination component re-renders from the shared
 * data model. As a catalog renderer (one per component type), it is mounted through the
 * A2-UI tree like any other component.
 */
export function PageSizeRenderer({
  props,
  dispatch,
}: TypedRendererProps<PageSizeProps, PageSizeAction>) {
  const selectId = useId();
  const {pageSize} = props;

  // `pageSize` is bound to the data model and is `undefined` on the first render, before
  // its `/state/<id>` op lands (A2-UI progressive rendering). Only fold a real numeric page
  // size into the option list, so the `<option>` keys stay unique (no `undefined`/`NaN` key)
  // and the ordering is stable.
  const currentPageSize = typeof pageSize === 'number' ? pageSize : undefined;
  const options = [
    ...new Set(
      currentPageSize === undefined
        ? DEFAULT_PAGE_SIZE_OPTIONS
        : [...DEFAULT_PAGE_SIZE_OPTIONS, currentPageSize]
    ),
  ].sort((a, b) => a - b);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(event.target.value);
    dispatch?.({event: {name: 'setPageSize', context: {pageSize: newSize}}});
  };

  return (
    <div className={styles.container}>
      <label className={styles.label} htmlFor={selectId}>
        <strong>Products per page:</strong>
      </label>
      <select
        id={selectId}
        className={styles.select}
        value={currentPageSize ?? ''}
        onChange={handleChange}
      >
        {options.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </div>
  );
}
