import {useRemoteController} from '../controllers.js';
import {useStateSource} from '../state-source-context.js';
import type {PageSizeProps} from '@coveo/thermidor-schema';
import styles from './PageSize.module.css';

const DEFAULT_PAGE_SIZE_OPTIONS = [12, 24, 48];

/**
 * A2-UI renderer for the `page-size` component: a "Products per page" selector.
 *
 * It reads the current page size from its own AG-UI state entry and dispatches `setPageSize`.
 * The backend applies the change to the surface's paging so the sibling pagination component
 * re-renders from the shared view. As a catalog renderer (one per component type), it is
 * mounted through the A2-UI tree like any other component.
 */
export function PageSizeRenderer({props}: {props: PageSizeProps}) {
  const stateSource = useStateSource();
  const controller = useRemoteController(stateSource, props.componentId, props.componentType);

  if (!controller.state) {
    return null;
  }

  const {pageSize} = controller.state;

  const options = [...new Set([...DEFAULT_PAGE_SIZE_OPTIONS, pageSize])].sort((a, b) => a - b);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(event.target.value);
    controller.dispatch('setPageSize', {pageSize: newSize});
  };

  return (
    <div className={styles.container}>
      <label className={styles.label} htmlFor={`page-size-select-${props.componentId}`}>
        <strong>Products per page:</strong>
      </label>
      <select
        id={`page-size-select-${props.componentId}`}
        className={styles.select}
        value={pageSize}
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
