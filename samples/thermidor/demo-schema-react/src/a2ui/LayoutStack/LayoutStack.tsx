import type {ReactNode} from 'react';
import type {LayoutStackProps} from '@coveo/thermidor-schema';
import {readChildIds} from '../read-child-ids.js';
import styles from './LayoutStack.module.css';

/**
 * A2-UI renderer for the generic `layout-stack` container component.
 *
 * Stacks its children along a single axis (column or row), mounting each declared child
 * id exactly once, first to last. Composition (`children`) and presentation (`direction`)
 * are read only from the renderer inputs, never from AG-UI state: a layout container holds
 * no business data, so its AG-UI state is empty.
 *
 * Both `children` and `direction` arrive on the resolved props (spread from the A2-UI node
 * by the Surface_Bridge). The generated `LayoutStackProps` type only models the correlation
 * fields (`componentId`/`componentType`), so the composition field is read defensively via
 * `readChildIds` (shared with the other container renderers) and the presentation field is
 * read through this widened view. An unknown or missing `direction` falls back to 'column'.
 */
type LayoutStackRendererProps = LayoutStackProps & {
  direction?: 'column' | 'row';
};

export function LayoutStackRenderer({
  props,
  children,
}: {
  props: LayoutStackRendererProps;
  children: (id: string) => ReactNode;
}) {
  const childIds = readChildIds(props);
  const direction = props.direction === 'row' ? 'row' : 'column';
  const className = direction === 'row' ? styles.row : styles.column;

  return (
    <div className={className} data-testid={props.componentId} data-direction={direction}>
      {childIds.map((childId) => (
        <div key={childId}>{children(childId)}</div>
      ))}
    </div>
  );
}
