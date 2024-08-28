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
    <div className="ProductsPerPage">
      <label className="ProductsPerPageLabel">Products per page:</label>
      {options.map((pageSize) => (
        <label key={pageSize} className="ProductsPerPageOption">
          <input
            type="radio"
            name="page"
            value={pageSize}
            checked={state.pageSize === pageSize}
            onChange={() => controller.setPageSize(pageSize)}
          />
          {pageSize}
        </label>
      ))}
      <label key={0} className="ProductsPerPageOptionOther">
        <input
          type="radio"
          name="page"
          value={state.pageSize}
          checked={state.pageSize === 0 || !options.includes(state.pageSize)}
          onChange={() => controller.setPageSize(0)}
        />
        {state.pageSize !== 0 && !options.includes(state.pageSize)
          ? `Other (${state.pageSize})`
          : 'Default'}
      </label>
    </div>
  );
}
