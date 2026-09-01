import {useRemoteController} from '../controllers.js';
import {useStateSource} from '../state-source-context.js';
import type {PaginationProps} from '@coveo/thermidor-schema';
import styles from './PageSizeSelector.module.css';

const DEFAULT_PAGE_SIZE_OPTIONS = [12, 24, 48];

/**
 * Renders a "Products per page" dropdown backed by the pagination component's
 * remote controller.
 *
 * This is intentionally a plain React component rather than a catalog-registered
 * renderer: page size lives in the pagination component's state and the
 * `setPageSize` action is on the pagination contract. The pagination
 * component instance is already rendered by `PaginationRenderer`, and a catalog
 * maps a single renderer per component type. `DecomposedCommerceLayout` renders
 * this control directly using the pagination component's props.
 */
export function PageSizeSelector({props}: {props: PaginationProps}) {
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
