import type {LayoutStackProps} from '@coveo/thermidor-schema/zod3';
import type {TypedRendererProps} from '../renderer-props.js';
import styles from './LayoutStack.module.css';

/**
 * A2-UI renderer for the generic `layout-stack` container component.
 *
 * Stacks its children along a single axis (column or row), mounting each declared child id
 * exactly once, first to last. Composition (`children`) and presentation (`direction`) are
 * read directly from the resolved props (the `layout-stack` holds no business state, so its
 * `XxxState` is empty; the `children` `ChildList` and the `direction` presentation prop
 * arrive as static values the binder passes through). Children are mounted by id via the
 * renderer's `children(id)` function — no positional destructuring, no defensive read.
 *
 * `direction` is a presentation prop declared on the container's Props_Schema but not part of
 * the (empty) resolved state, so it is read through this widened view. An unknown or missing
 * `direction` falls back to 'column'.
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
