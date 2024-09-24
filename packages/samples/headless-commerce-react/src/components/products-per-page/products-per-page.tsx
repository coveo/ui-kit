import {Pagination} from '@coveo/headless/commerce';
import {useEffect, useState} from 'react';

interface IProductsPerPageProps {
  controller: Pagination;
}

export default function ProductsPerPage(props: IProductsPerPageProps) {
  const {controller} = props;

  const [state, setState] = useState(controller.state);

  useEffect(() => {
    controller.subscribe(() => setState(controller.state));
  }, [controller]);

  const options = [5, 10, 20, 50];
  return (
    <span className="ProductsPerPage">
      <span className="ProductsPerPageLabel">Products per page:</span>
      {options.map((pageSize) => {
        const id = `page-size-${pageSize}`;
        return (
          <span key={pageSize}>
            <input
              checked={state.pageSize === pageSize}
              id={id}
              name={`pageSize-${pageSize}`}
              onChange={() => controller.setPageSize(pageSize)}
              type="radio"
              value={pageSize}
            />
            <label className="ProductsPerPageOption" htmlFor={id}>
              {pageSize}
            </label>
          </span>
        );
      })}
      <span className="ProductsPerPageOptionOther">
        <input
          checked={state.pageSize === 0 || !options.includes(state.pageSize)}
          id="page-size-other"
          name="page"
          onChange={() => controller.setPageSize(0)}
          type="radio"
          value={state.pageSize}
        />
        <label htmlFor="page-size-other" key={0}>
          {state.pageSize !== 0 && !options.includes(state.pageSize)
            ? `Other (${state.pageSize})`
            : 'Default'}
        </label>
      </span>
    </span>
  );
}
