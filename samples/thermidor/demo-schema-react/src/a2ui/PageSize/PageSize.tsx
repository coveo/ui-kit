import {useId} from 'react';
import {createReactComponent} from '@copilotkit/a2ui-renderer';
import type {PageSizeAction} from '@coveo/thermidor-schema';
import {PageSizePropsSchema} from '@coveo/thermidor-schema/zod3';
import {useOptimisticValue} from '../use-optimistic-value.js';
import styles from './PageSize.module.css';

const DEFAULT_PAGE_SIZE_OPTIONS = [12, 24, 48];

/**
 * A2-UI component for the `page-size` selector: a "Products per page" dropdown. The generic binder
 * resolves `pageSize` from `PageSizePropsSchema`; the change handler dispatches `setPageSize`. The
 * chosen size is held on screen and the grid dims (`invalidates: ['results']`) until the producer
 * answers.
 */
export const PageSize = createReactComponent(
  {name: 'PageSize', schema: PageSizePropsSchema},
  ({props, context}) => {
    const selectId = useId();

    const {value: pageSize, dispatchOptimistic} = useOptimisticValue(
      props.pageSize,
      (action: PageSizeAction) => context.dispatchAction(action)
    );

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
      const setPageSizeAction: PageSizeAction = {
        event: {name: 'setPageSize', context: {pageSize: newSize}},
      };
      dispatchOptimistic({
        action: setPageSizeAction,
        next: () => newSize,
        coalesce: 'absolute',
        invalidates: ['results'],
      });
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
);
