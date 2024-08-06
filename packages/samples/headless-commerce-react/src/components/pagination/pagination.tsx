import {Pagination as HeadlessPagination} from '@coveo/headless/commerce';
import {useEffect, useState} from 'react';

interface IPaginationProps {
  controller: HeadlessPagination;
}

export default function Pagination(props: IPaginationProps) {
  const {controller} = props;

  const [state, setState] = useState(controller.state);

  useEffect(() => {
    controller.subscribe(() => setState(controller.state));
  }, [controller]);

  const renderPageRadioButtons = () => {
    return Array.from({length: state.totalPages}, (_, i) => {
      const page = i + 1;
      return (
        <label className="SelectPage" key={page}>
          <input
            type="radio"
            name="page"
            value={page - 1}
            checked={state.page === page - 1}
            onChange={() => controller.selectPage(page - 1)}
          />
          {page}
        </label>
      );
    });
  };

  return (
    <div className="Pagination">
      <button
        className="PreviousPage"
        disabled={state.page === 0}
        onClick={controller.previousPage}
      >
        {'<'}
      </button>
      {renderPageRadioButtons()}
      <button
        className="NextPage"
        disabled={state.page === state.totalPages - 1}
        onClick={controller.nextPage}
      >
        {'>'}
      </button>
    </div>
  );
}
