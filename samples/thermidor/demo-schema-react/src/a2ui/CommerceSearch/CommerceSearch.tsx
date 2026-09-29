import {createReactComponent} from '@copilotkit/a2ui-renderer';

import {CommerceSearchPropsSchema} from '@coveo/thermidor-schema/zod3';
import styles from './CommerceSearch.module.css';

/**
 * A2-UI component for the `commerce-search` surface root.
 *
 * A two-column grid whose named `sidebarChild` / `mainChild` slots (resolved by the generic binder
 * from `CommerceSearchPropsSchema`) are mounted via `buildChild(...)` — addressed by name, not
 * position. An absent slot renders an empty cell.
 */
export const CommerceSearch = createReactComponent(
  {
    name: 'CommerceSearch',
    schema: CommerceSearchPropsSchema,
  },
  ({props, buildChild}) => {
    const {sidebarChild, mainChild} = props;

    return (
      <div data-testid="commerce-search">
        <div className={styles.page}>
          <aside className={styles.sidebar}>
            {sidebarChild !== undefined && <div key={sidebarChild}>{buildChild(sidebarChild)}</div>}
          </aside>
          <main className={styles.main}>
            {mainChild !== undefined && <div key={mainChild}>{buildChild(mainChild)}</div>}
          </main>
        </div>
      </div>
    );
  }
);
