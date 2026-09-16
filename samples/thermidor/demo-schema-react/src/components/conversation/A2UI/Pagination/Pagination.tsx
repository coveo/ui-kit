import {useRemoteController} from '../controllers.js';
import {useStateSource} from '../state-source-context.js';
import type {PaginationProps} from '@coveo/thermidor-schema';
import styles from './Pagination.module.css';

export function PaginationRenderer({props}: {props: PaginationProps}) {
  const stateSource = useStateSource();
  const controller = useRemoteController(stateSource, props.componentId, props.componentType);

  if (!controller.state) {
    return null;
  }

  const {page, totalPages} = controller.state;

  if (totalPages <= 1) {
    return null;
  }

  const handlePageChange = (newPage: number) => {
    controller.dispatch('selectPage', {page: newPage});
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
