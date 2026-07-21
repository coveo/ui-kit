import {buildPaginationController} from '@coveo/thermidor';
import {useSearchInterface} from '../../context/search-interface.js';
import {useBuildController} from '../../hooks/use-build-controller.js';
import styles from './Pagination.module.css';

export function Pagination() {
  const searchInterface = useSearchInterface();

  const [controller, state] = useBuildController(() =>
    buildPaginationController({interface: searchInterface})
  );

  if (state.totalPages <= 1) {
    return null;
  }

  return (
    <nav className={styles.nav} aria-label="Search results pagination">
      <button
        className={styles.button}
        onClick={() => controller.selectPage(state.page - 1)}
        disabled={state.page === 0}
      >
        Previous
      </button>
      <span className={styles.info}>
        Page {state.page + 1} of {state.totalPages}
      </span>
      <button
        className={styles.button}
        onClick={() => controller.selectPage(state.page + 1)}
        disabled={state.page >= state.totalPages - 1}
      >
        Next
      </button>
    </nav>
  );
}
