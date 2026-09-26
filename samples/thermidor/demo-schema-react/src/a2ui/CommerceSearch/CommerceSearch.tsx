import type {CommerceSearchProps} from '@coveo/thermidor-schema';
import type {TypedRendererProps} from '../renderer-props.js';
import styles from './CommerceSearch.module.css';

/**
 * A2-UI renderer for the `commerce-search` surface root.
 *
 * A two-column grid whose named `sidebarChild` / `mainChild` slots are mounted
 * via `children(...)` (addressed by name, not position). An absent slot renders
 * an empty cell.
 */
export function CommerceSearchRenderer({
  props,
  children,
}: TypedRendererProps<CommerceSearchProps, never>) {
  const {sidebarChild, mainChild} = props;

  return (
    <div data-testid="commerce-search">
      <div className={styles.page}>
        <aside className={styles.sidebar}>
          {sidebarChild !== undefined && <div key={sidebarChild}>{children(sidebarChild)}</div>}
        </aside>
        <main className={styles.main}>
          {mainChild !== undefined && <div key={mainChild}>{children(mainChild)}</div>}
        </main>
      </div>
    </div>
  );
}
