import {createReactComponent} from '@copilotkit/a2ui-renderer';
import {CommerceSearch} from '../../../../demo-schema-react/src/a2ui/CommerceSearch/CommerceSearch.js';
import styles from '../../../../demo-schema-react/src/a2ui/CommerceSearch/CommerceSearch.module.css';
import {useRestoreOnReturn} from './use-restore-on-return.js';

/**
 * `demo-schema-react`'s commerce search layout, restored on Back. The storefront keeps the
 * browser history of its pages, so the layout records no history entries of its own: returning
 * to its page restores it instead (see `useRestoreOnReturn`).
 */
export const StorefrontCommerceSearch = createReactComponent(
  // demo-schema-react's schema: this sample resolves `@coveo/thermidor-schema/zod3` against
  // another zod, whose props type is too deep for the renderer's binder to infer.
  {name: CommerceSearch.name, schema: CommerceSearch.schema},
  ({props, buildChild, context}) => {
    useRestoreOnReturn(context);
    const {sidebarChild, mainChild} = props as {sidebarChild?: string; mainChild?: string};

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
