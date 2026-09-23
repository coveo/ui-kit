import type {FacetManagerProps} from '@coveo/thermidor-schema';
import type {TypedRendererProps} from '../renderer-props.js';
import styles from './FacetManager.module.css';

/**
 * A2-UI renderer for the `facet-manager` container.
 *
 * Mounts its ordered facet children first-to-last. Composition arrives as the resolved
 * `children` `ChildList` (a `string[]` of ids the binder passes through untouched); each id
 * is mounted by name via the renderer's `children(id)` function — no positional read.
 */
export function FacetManagerRenderer({
  props,
  children,
}: TypedRendererProps<FacetManagerProps, never>) {
  const childIds = props.children ?? [];

  return (
    <div className={styles.container} data-testid="facet-manager">
      {childIds.map((childId) => (
        <div key={childId}>{children(childId)}</div>
      ))}
    </div>
  );
}
