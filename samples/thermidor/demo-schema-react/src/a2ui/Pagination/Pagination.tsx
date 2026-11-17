import {useOptimistic} from 'react';
import {createReactComponent} from '@copilotkit/a2ui-renderer';
import type {PaginationAction} from '@coveo/thermidor-schema';
import {PaginationPropsSchema} from '@coveo/thermidor-schema/zod3';
import {useGesture} from '../session-request.js';
import styles from './Pagination.module.css';

const NUMBER_OF_PAGES = 5;

/** A2-UI component for the `pagination` controls. */
export const Pagination = createReactComponent(
  {name: 'Pagination', schema: PaginationPropsSchema},
  ({props, context}) => {
    const {totalPages} = props;

    const [heldPage, addOptimisticPage] = useOptimistic(props.page);
    const startGesture = useGesture();

    // An unresolved `totalPages` would slip past the `<= 1` guard and send a NaN `selectPage`.
    if (heldPage === undefined || totalPages === undefined) {
      return null;
    }

    if (totalPages <= 1) {
      return null;
    }

    // The producer can answer with fewer pages than the held one (e.g. a larger page size).
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
      startGesture(
        () => addOptimisticPage(newPage),
        () => context.dispatchAction(selectPageAction)
      );
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
