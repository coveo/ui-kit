import {createReactComponent} from '@copilotkit/a2ui-renderer';
import {type BreadboxAction, BreadboxPropsSchema} from '@coveo/thermidor-schema/zod3';
import {breadboxValues} from './breadbox-values.js';
import {useOptimisticBreadbox} from './use-optimistic-breadbox.js';
import styles from './Breadbox.module.css';

/**
 * A2-UI component for the `breadbox`. Renders the active values of every facet, one group per
 * facet, and hides itself when none is active. Removals are optimistic: the value leaves the
 * breadbox at once while the facets and the results catch up with the response.
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
        <ul className={styles.facets}>
          {facets.map((facet) => (
            <li
              key={facet.facetId}
              className={styles.facet}
              data-testid={`breadbox-${facet.facetId}`}
            >
              <span className={styles.label}>{facet.displayName}:</span>
              {breadboxValues(facet).map((value) => (
                <button
                  key={value.key}
                  type="button"
                  className={value.excluded ? `${styles.value} ${styles.excluded}` : styles.value}
                  aria-label={`Remove ${value.excluded ? 'exclusion' : 'inclusion'} filter on ${facet.displayName}: ${value.label}`}
                  data-testid={`breadbox-value-${value.key}`}
                  onClick={() => deselect(value.payload)}
                >
                  <span className={styles.valueLabel}>{value.label}</span>
                  <span aria-hidden="true">×</span>
                </button>
              ))}
            </li>
          ))}
        </ul>
        <button type="button" className={styles.clearAll} onClick={clearAll}>
          Clear all
        </button>
      </section>
    );
  }
);
