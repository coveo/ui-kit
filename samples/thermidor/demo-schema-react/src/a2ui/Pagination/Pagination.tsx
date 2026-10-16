import {createReactComponent} from '@copilotkit/a2ui-renderer';
import type {PaginationAction} from '@coveo/thermidor-schema';
import {PaginationPropsSchema} from '@coveo/thermidor-schema/zod3';
import {useOptimisticValue} from '../use-optimistic-value.js';
import {useStale} from '../pending-dispatch.js';
import styles from './Pagination.module.css';

const NUMBER_OF_PAGES = 5;

/** A2-UI component for the `pagination` controls. */
export const Pagination = createReactComponent(
  {name: 'Pagination', schema: PaginationPropsSchema},
  ({props, context}) => {
    const {totalPages} = props;

    const {value: heldPage, dispatchOptimistic} = useOptimisticValue(
      props.page,
      (action: PaginationAction) => {
        context.dispatchAction(action);
      }
    );
    // Frozen while stale: a sibling `setPageSize` may change `totalPages` under us.
    const resultsStale = useStale('results');

    // An unresolved `totalPages` would slip past the `<= 1` guard and send a NaN `selectPage`.
    if (heldPage === undefined || totalPages === undefined) {
      return null;
    }

    if (totalPages <= 1) {
      return null;
    }

    // A concurrent gesture can shrink `totalPages` under the held page.
    const page = Math.min(Math.max(heldPage, 0), totalPages - 1);

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
      <nav className={styles.pagination} aria-label="Pagination" aria-busy={resultsStale}>
        <button
          className={styles.navButton}
          onClick={() => handlePageChange(page - 1)}
          disabled={resultsStale || page <= 0}
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
              disabled={resultsStale}
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
          disabled={resultsStale || page >= totalPages - 1}
          aria-label="Next page"
          type="button"
        >
          &#8250;
        </button>
      </nav>
    );
  }
);
