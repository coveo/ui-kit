import {useCallback, useSyncExternalStore} from 'react';
import type {PaginationController} from '@coveo/thermidor';
import styles from './PageSizeSelector.module.css';

const PAGE_SIZE_OPTIONS = [10, 25, 50];

interface PageSizeSelectorProps {
  controller: PaginationController;
}

export function PageSizeSelector({controller}: PageSizeSelectorProps) {
  const subscribe = useCallback(
    (onStoreChange: () => void) => controller.subscribe(onStoreChange),
    [controller]
  );
  const getSnapshot = useCallback(() => controller.state, [controller]);
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(event.target.value);
    controller.setPageSize(newSize);
    controller.selectPage(0);
  };

  return (
    <div className={styles.container}>
      <label className={styles.label} htmlFor="page-size-select">
        <strong>Products per page:</strong>
      </label>
      <select
        id="page-size-select"
        className={styles.select}
        value={state.pageSize}
        onChange={handleChange}
      >
        {PAGE_SIZE_OPTIONS.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </div>
  );
}
