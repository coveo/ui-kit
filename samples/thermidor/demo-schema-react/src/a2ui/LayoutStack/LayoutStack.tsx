import type {LayoutStackProps} from '@coveo/thermidor-schema';
import type {TypedRendererProps} from '../renderer-props.js';
import styles from './LayoutStack.module.css';

/**
 * A2-UI renderer for the generic `layout-stack` container.
 *
 * Stacks its children along one axis, mounting each child id once via
 * `children(id)`. `children` and `direction` come from resolved props (the
 * container holds no state). `direction` is a presentation prop read through a
 * widened view; unknown/missing falls back to 'column'.
 */
type LayoutStackResolvedProps = LayoutStackProps & {
  direction?: 'column' | 'row';
};

export function LayoutStackRenderer({
  props,
  children,
}: TypedRendererProps<LayoutStackResolvedProps, never>) {
  const childIds = props.children ?? [];
  const direction = props.direction === 'row' ? 'row' : 'column';
  const className = direction === 'row' ? styles.row : styles.column;

  return (
    <div className={className} data-testid="layout-stack" data-direction={direction}>
      {childIds.map((childId) => (
        <div key={childId}>{children(childId)}</div>
      ))}
    </div>
  );
}
