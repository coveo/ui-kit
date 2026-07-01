import type {Pager as PagerController} from '@coveo/headless';
import {useController} from '../use-controller';

interface PagerProps {
  controller: PagerController;
}

export function Pager({controller}: PagerProps) {
  const {currentPage, currentPages, hasPreviousPage, hasNextPage} =
    useController(controller);

  return (
    <nav className="pager" aria-label="Pagination">
      <button
        type="button"
        disabled={!hasPreviousPage}
        onClick={() => controller.previousPage()}
      >
        ‹ Prev
      </button>
      {currentPages.map((page) => (
        <button
          type="button"
          key={page}
          className={
            page === currentPage ? 'pager__page active' : 'pager__page'
          }
          aria-current={page === currentPage}
          onClick={() => controller.selectPage(page)}
        >
          {page}
        </button>
      ))}
      <button
        type="button"
        disabled={!hasNextPage}
        onClick={() => controller.nextPage()}
      >
        Next ›
      </button>
    </nav>
  );
}
