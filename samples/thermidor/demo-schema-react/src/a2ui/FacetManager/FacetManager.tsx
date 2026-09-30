import {createReactComponent} from '@copilotkit/a2ui-renderer';

import {FacetManagerPropsSchema} from '@coveo/thermidor-schema/zod3';
import styles from './FacetManager.module.css';

/**
 * A2-UI component for the `facet-manager` container.
 *
 * Mounts its ordered facet children first-to-last. The generic binder resolves the `children`
 * `ChildList` (a `string[]` of ids passed through untouched) from `FacetManagerPropsSchema`; each
 * id is mounted by name via `buildChild(id)` — no positional read.
 */
export const FacetManager = createReactComponent(
  {
    name: 'FacetManager',
    schema: FacetManagerPropsSchema,
  },
  ({props, buildChild}) => {
    const childIds = props.children ?? [];

    return (
      <div className={styles.container} data-testid="facet-manager">
        {childIds.map((childId: string) => (
          <div key={childId}>{buildChild(childId)}</div>
        ))}
      </div>
    );
  }
);
