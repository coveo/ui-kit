import styles from './Pagination.module.css';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

interface PaginationProps {
  page: number;
  totalPages: number;
  pageSize: number;
  onPrevious: () => void;
  onNext: () => void;
  onPageSizeChange: (size: number) => void;
}

export function Pagination({
  page,
  totalPages,
  pageSize,
  onPrevious,
  onNext,
  onPageSizeChange,
}: PaginationProps) {
  const isPreviousDisabled = page === 0;
  const isNextDisabled = totalPages <= 1 || page === totalPages - 1;

  return (
    <div className={styles.container}>
      <button
        className={styles.button}
        onClick={onPrevious}
        disabled={isPreviousDisabled}
        aria-label="Previous page"
      >
        ← Previous
      </button>
      <span className={styles.indicator}>
        Page {page + 1} of {totalPages}
      </span>
      <button
        className={styles.button}
        onClick={onNext}
        disabled={isNextDisabled}
        aria-label="Next page"
      >
        Next →
      </button>
      <select
        className={styles.pageSizeSelect}
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        aria-label="Results per page"
      >
        {PAGE_SIZE_OPTIONS.map((size) => (
          <option key={size} value={size}>
            {size} per page
          </option>
        ))}
      </select>
    </div>
  );
}
