import type {CommerceSearchProps} from '@coveo/thermidor-schema';
import type {TypedRendererProps} from '../renderer-props.js';
import styles from './CommerceSearch.module.css';

/**
 * A2-UI renderer for the `commerce-search` surface-root component.
 *
 * Owns the surface's two-column grid: a narrow left sidebar and a flexible right main area.
 * Composition follows the standard A2-UI named-slot convention: the container's resolved
 * props carry two typed `child-ref` slots — `sidebarChild` and `mainChild` — that the binder
 * passes through untouched. The sidebar cell mounts `children(props.sidebarChild)` and the
 * main cell mounts `children(props.mainChild)`, each itself typically a `layout-stack` that
 * owns its column's internal layout. Slots are addressed by name, never by array position:
 * there is no positional read of a child id list.
 *
 * A slot whose value is absent renders an empty cell; a slot referencing an id with no
 * corresponding component is skipped by the mount function returning nothing renderable.
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
