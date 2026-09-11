import type {ReactNode} from 'react';
import type {CommerceSearchProps} from '@coveo/thermidor-schema';
import {readChildIds} from '../read-child-ids.js';
import styles from './CommerceSearch.module.css';

/**
 * A2-UI renderer for the `commerce-search` surface-root component.
 *
 * Owns the surface's two-column grid: a narrow left sidebar and a flexible right main area.
 * It composes exactly two children on the A2-UI plane — the first is mounted into the sidebar
 * cell, the second into the main cell — keeping the renderer generic: each child is itself a
 * `layout-stack` that owns its column's internal layout. Placement is driven from the A2-UI
 * composition (the node's `children` order), never from AG-UI state.
 *
 * Composition (`children`) is read only from the renderer inputs. The first two declared child
 * ids map to the sidebar and main cells respectively; any further ids are mounted after the
 * main child so no declared child is silently dropped. An empty `children` list renders a
 * stable empty two-column layout. A declared child id with no corresponding component is
 * skipped by the mount function returning nothing renderable.
 */
export function CommerceSearchRenderer({
  props,
  children,
}: {
  props: CommerceSearchProps;
  children: (id: string) => ReactNode;
}) {
  // The A2-UI node's ordered child ids arrive on the resolved props alongside the
  // schema fields; the schema type does not surface the composition field, so it is
  // read at this single boundary via the shared defensive reader.
  const childIds = readChildIds(props);
  const [sidebarId, mainId, ...extraIds] = childIds;

  return (
    <div data-testid={props.componentId}>
      <div className={styles.page}>
        <aside className={styles.sidebar}>
          {sidebarId !== undefined && <div key={sidebarId}>{children(sidebarId)}</div>}
        </aside>
        <main className={styles.main}>
          {mainId !== undefined && <div key={mainId}>{children(mainId)}</div>}
          {extraIds.map((childId) => (
            <div key={childId}>{children(childId)}</div>
          ))}
        </main>
      </div>
    </div>
  );
}
