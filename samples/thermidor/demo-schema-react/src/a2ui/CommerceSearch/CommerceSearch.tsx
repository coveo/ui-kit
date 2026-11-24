import {createComponentImplementation} from '@a2ui/react/v0_9';
import {componentId} from '@a2ui/web_core/v0_9';
import {CommerceSearchPropsSchema} from '@coveo/thermidor-schema/zod3';
import styles from './CommerceSearch.module.css';
import {useSearchHistory} from './use-search-history.js';

/**
 * A2-UI component for the `commerce-search` surface root.
 *
 * A two-column grid whose named `sidebarChild` / `mainChild` slots are mounted via
 * `buildChild(...)` — addressed by name, not position. The schema marks both slots as component
 * ids, which is how `@a2ui/react` knows to build their child nodes. An absent slot renders an
 * empty cell. Browser back and forward restore the searches the surface went through.
 */
export const CommerceSearch = createComponentImplementation(
  {
    name: 'CommerceSearch',
    schema: CommerceSearchPropsSchema.extend({
      sidebarChild: componentId().optional(),
      mainChild: componentId().optional(),
    }),
  },
  ({props, buildChild, context}) => {
    useSearchHistory(context);
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
