import {createReactComponent} from '@copilotkit/a2ui-renderer';
import type {PaginationAction} from '@coveo/thermidor-schema';
import {PaginationPropsSchema} from '@coveo/thermidor-schema/zod3';
import {useOptimisticValue} from '../use-optimistic-value.js';
import styles from './Pagination.module.css';

const NUMBER_OF_PAGES = 5;

/**
 * A2-UI component for the `pagination` controls. The generic binder resolves `page` / `totalPages`
 * from `PaginationPropsSchema` (progressively — either may be undefined on an early render);
 * navigating dispatches `selectPage`. The target page is held on screen and the grid dims
 * (`invalidates: ['results']`) until the producer answers.
 */
export const Pagination = createReactComponent(
  {name: 'Pagination', schema: PaginationPropsSchema},
  ({props, context}) => {
    const {totalPages} = props;

    // Called before the early returns below so the hook order stays stable across renders.
    const {value: page, dispatchOptimistic} = useOptimisticValue(
      props.page,
      (action: PaginationAction) => context.dispatchAction(action)
    );

    // The `{ path }` bindings resolve progressively; until both are numbers the
    // pagination shell must not render (an unresolved `totalPages` would otherwise
    // slip past the `<= 1` guard and dispatch a NaN `selectPage`).
    if (page === undefined || totalPages === undefined) {
      return null;
    }

    if (totalPages <= 1) {
      return null;
    }

    const firstPage = Math.max(
      0,
      Math.min(page - Math.floor(NUMBER_OF_PAGES / 2), totalPages - NUMBER_OF_PAGES)
    );
    const pages = Array.from(
      {length: Math.min(NUMBER_OF_PAGES, totalPages)},
      (_, i) => firstPage + i
    );

    const handlePageChange = (newPage: number) => {
      const selectPageAction: PaginationAction = {
        event: {name: 'selectPage', context: {page: newPage}},
      };
      dispatchOptimistic({
        action: selectPageAction,
        next: () => newPage,
        coalesce: 'absolute',
        invalidates: ['results'],
      });
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
          {pages.map((i) => (
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
