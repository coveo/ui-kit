'use client';

import {usePagination} from '@/lib/commerce-engine';

export default function ProductsPerPage() {
  const {state, methods} = usePagination();

  const options = [5, 10, 20, 50, 0];

  return (
    <span className="ProductsPerPage">
      <span className="ProductsPerPageLabel">Products per page:</span>
      {options.map((pageSize) => {
        const id = `page-size-${pageSize}`;
        return (
          <span key={id}>
            <input
              checked={
                state.pageSize === pageSize ||
                (pageSize === 0 && !options.includes(state.pageSize))
              }
              id={id}
              name={`pageSize-${pageSize}`}
              onChange={() => methods?.setPageSize(pageSize)}
              type="radio"
              value={pageSize}
              disabled={methods === undefined}
            />
            <label className="ProductsPerPageOption" htmlFor={id}>
              {pageSize === 0 ? 'Default' : pageSize}
            </label>
          </span>
        );
      })}
    </span>
  );
}
