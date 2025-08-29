import type {Pagination} from '@coveo/headless/commerce';
import {useEffect, useState} from 'react';

interface IProductsPerPageProps {
  controller: Pagination;
}

export default function ProductsPerPage(props: IProductsPerPageProps) {
  const {controller} = props;

  const [state, setState] = useState(controller.state);

  const options = [5, 10, 20, 50, 0];

  useEffect(() => {
    controller.subscribe(() => setState(controller.state));
  }, [controller]);

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
              onChange={() => controller.setPageSize(pageSize)}
              type="radio"
              value={pageSize}
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
