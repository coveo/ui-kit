import {createReactComponent} from '@copilotkit/a2ui-renderer';
import {type BreadboxAction, BreadboxPropsSchema} from '@coveo/thermidor-schema/zod3';
import {CloseIcon} from '../icons/index.js';
import {breadboxValues} from './breadbox-values.js';
import {useOptimisticBreadbox} from './use-optimistic-breadbox.js';
import styles from './Breadbox.module.css';

/**
 * A2-UI component for the `breadbox`, laid out like the Atomic commerce breadbox: a "Filters:"
 * label, one "Facet: value" button per active value, and a clear-all button. Hidden when no facet
 * is active. Removals are optimistic: the value leaves the breadbox at once while the facets and
 * the results catch up with the response.
 */
export const Breadbox = createReactComponent(
  {
    name: 'Breadbox',
    schema: BreadboxPropsSchema,
  },
  ({props, context}) => {
    const dispatch = (action: BreadboxAction) => {
      context.dispatchAction(action);
    };
    const {facets, deselect, clearAll} = useOptimisticBreadbox(props, dispatch);

    if (facets.length === 0) {
      return null;
    }

    return (
      <section className={styles.container} aria-label="Active filters">
        <span className={styles.heading}>Filters:</span>
        <ul className={styles.list}>
          {facets.flatMap((facet) =>
            breadboxValues(facet).map((value) => {
              const title = `${facet.displayName}: ${value.fullLabel}`;
              return (
                <li key={`${facet.facetId}/${value.key}`}>
                  <button
                    type="button"
                    className={
                      value.excluded ? `${styles.breadcrumb} ${styles.excluded}` : styles.breadcrumb
                    }
                    title={title}
                    aria-label={`Remove ${value.excluded ? 'exclusion' : 'inclusion'} filter on ${title}`}
                    onClick={() => deselect(value.payload)}
                  >
                    <span className={styles.label}>{facet.displayName}:</span>
                    <span className={styles.value}>{value.label}</span>
                    <CloseIcon className={styles.clearIcon} />
                  </button>
                </li>
              );
            })
          )}
          <li>
            <button
              type="button"
              className={styles.clearAll}
              aria-label="Clear all filters"
              onClick={clearAll}
            >
              Clear
            </button>
          </li>
        </ul>
      </section>
    );
  }
);
