'use client';

import {usePagination} from '@/lib/commerce-engine';

// Maximum number of page buttons to show at once (a sliding window centered on
// the current page), so a large result set doesn't render hundreds of buttons.
const MAX_PAGE_BUTTONS = 5;

export default function Pagination() {
  const {state, methods} = usePagination();

  if (state.totalPages <= 1) {
    return null;
  }

  // Compute a window of pages centered on the current page, clamped to range.
  const half = Math.floor(MAX_PAGE_BUTTONS / 2);
  const end = Math.min(
    state.totalPages,
    Math.max(state.page + half + 1, MAX_PAGE_BUTTONS)
  );
  const start = Math.max(0, end - MAX_PAGE_BUTTONS);
  const pages = Array.from({length: end - start}, (_, i) => start + i);

  return (
    <div className="Pagination">
      <div>
        Page {state.page + 1} of {state.totalPages}
      </div>
      <button
        type="button"
        className="PreviousPage"
        disabled={methods === undefined || state.page === 0}
        onClick={methods?.previousPage}
      >
        {'<'}
      </button>
      {pages.map((page) => (
        <label className="SelectPage" key={page}>
          <input
            type="radio"
            name="page"
            value={page}
            checked={state.page === page}
            onChange={() => methods?.selectPage(page)}
            disabled={methods === undefined}
          />
          {page + 1}
        </label>
      ))}
      <button
        type="button"
        className="NextPage"
        disabled={methods === undefined || state.page === state.totalPages - 1}
        onClick={methods?.nextPage}
      >
        {'>'}
      </button>
    </div>
  );
}
