import {paginationController} from '../../commerce-setup.js';
import {useController} from '../../hooks/use-controller.js';
import styles from './Pagination.module.css';

export function Pagination() {
  const state = useController(paginationController);

  if (state.totalPages <= 1) {
    return null;
  }

  return (
    <nav className={styles.nav} aria-label="Product results pagination">
      <button
        className={styles.button}
        onClick={() => paginationController.selectPage(state.page - 1)}
        disabled={state.page === 0}
      >
        Previous
      </button>
      <span className={styles.info}>
        Page {state.page + 1} of {state.totalPages}
      </span>
      <button
        className={styles.button}
        onClick={() => paginationController.selectPage(state.page + 1)}
        disabled={state.page >= state.totalPages - 1}
      >
        Next
      </button>
    </nav>
  );
}
