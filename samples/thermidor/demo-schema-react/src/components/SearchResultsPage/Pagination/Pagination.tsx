import {useCallback, useSyncExternalStore} from 'react';
import type {PaginationController} from '@coveo/thermidor';
import {computeVisiblePages} from './pagination-utils.js';
import styles from './Pagination.module.css';

interface PaginationProps {
  controller: PaginationController;
}

export function Pagination({controller}: PaginationProps) {
  const subscribe = useCallback(
    (onStoreChange: () => void) => controller.subscribe(onStoreChange),
    [controller]
  );
  const getSnapshot = useCallback(() => controller.state, [controller]);
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  if (state.totalPages <= 1) {
    return null;
  }

  const pages = computeVisiblePages(state.page, state.totalPages);

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <button
        type="button"
        className={styles.navButton}
        disabled={state.page === 0}
        onClick={() => controller.selectPage(state.page - 1)}
        aria-label="Previous page"
      >
        ‹
      </button>

      <div className={styles.pages}>
        {pages.map((item) => {
          if (item === 'ellipsis-start' || item === 'ellipsis-end') {
            return (
              <span key={item} className={styles.ellipsis}>
                &hellip;
              </span>
            );
          }

          const isActive = item === state.page;
          return (
            <button
              key={`page-${item}`}
              type="button"
              className={`${styles.pageButton} ${isActive ? styles.active : ''}`}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => controller.selectPage(item)}
            >
              {item + 1}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className={styles.navButton}
        disabled={state.page === state.totalPages - 1}
        onClick={() => controller.selectPage(state.page + 1)}
        aria-label="Next page"
      >
        ›
      </button>
    </nav>
  );
}
