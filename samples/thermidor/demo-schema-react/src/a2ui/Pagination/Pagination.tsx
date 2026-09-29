import {createReactComponent} from '@copilotkit/a2ui-renderer';
import type {PaginationAction, PaginationProps} from '@coveo/thermidor-schema';
import {PaginationPropsSchema} from '@coveo/thermidor-schema/zod3';
import {toInferableBinderSchema} from '../inferable-binder-schema.js';
import styles from './Pagination.module.css';

/**
 * A2-UI component for the `pagination` controls. The generic binder resolves `page` / `totalPages`
 * from `PaginationPropsSchema` (progressively — either may be undefined on an early render);
 * navigating dispatches `selectPage` through `context.dispatchAction`.
 */
export const Pagination = createReactComponent(
  {name: 'Pagination', schema: toInferableBinderSchema<PaginationProps>(PaginationPropsSchema)},
  ({props, context}) => {
    const {page, totalPages} = props;

    // The `{ path }` bindings resolve progressively; until both are numbers the
    // pagination shell must not render (an unresolved `totalPages` would otherwise
    // slip past the `<= 1` guard and dispatch a NaN `selectPage`).
    if (page === undefined || totalPages === undefined) {
      return null;
    }

    if (totalPages <= 1) {
      return null;
    }

    const handlePageChange = (newPage: number) => {
      const selectPageAction: PaginationAction = {
        event: {name: 'selectPage', context: {page: newPage}},
      };
      context.dispatchAction(selectPageAction);
    };

    return (
      <nav className={styles.pagination} aria-label="Pagination">
        <button
          className={styles.navButton}
          onClick={() => handlePageChange(page - 1)}
          disabled={page <= 0}
          aria-label="Previous page"
          type="button"
        >
          &#8249;
        </button>

        <div className={styles.pages}>
          {Array.from({length: totalPages}, (_, i) => (
            <button
              key={i}
              className={`${styles.pageButton} ${i === page ? styles.active : ''}`}
              onClick={() => handlePageChange(i)}
              aria-label={`Page ${i + 1}`}
              aria-current={i === page ? 'page' : undefined}
              type="button"
            >
              {i + 1}
            </button>
          ))}
        </div>

        <button
          className={styles.navButton}
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= totalPages - 1}
          aria-label="Next page"
          type="button"
        >
          &#8250;
        </button>
      </nav>
    );
  }
);
