import type {Pagination as HeadlessPagination} from '@coveo/headless/commerce';
import {useEffect, useState} from 'react';

interface IPaginationProps {
  controller: HeadlessPagination;
}

export default function Pagination(props: IPaginationProps) {
  const {controller} = props;

  const [state, setState] = useState(controller.state);

  useEffect(() => {
    // Sync to the controller's current state and subscribe to future updates.
    setState({...controller.state});
    return controller.subscribe(() => setState({...controller.state}));
  }, [controller]);

  if (state.totalPages <= 1) {
    return null;
  }

  // Show a sliding window of at most MAX_PAGE_BUTTONS page numbers around the
  // current page rather than every page (there can be dozens).
  const MAX_PAGE_BUTTONS = 10;

  const renderPageRadioButtons = () => {
    const {page, totalPages} = state;
    const half = Math.floor(MAX_PAGE_BUTTONS / 2);
    let start = Math.max(0, page - half);
    const end = Math.min(totalPages, start + MAX_PAGE_BUTTONS);
    start = Math.max(0, end - MAX_PAGE_BUTTONS);

    return Array.from({length: end - start}, (_, i) => {
      const page = start + i + 1;
      const id = `page-${page}`;
      return (
        <span className="PageRadioButton" key={id}>
          <input
            id={id}
            type="radio"
            name="page"
            value={page - 1}
            checked={state.page === page - 1}
            onChange={() => controller.selectPage(page - 1)}
          />
          <label className="SelectPage" htmlFor={id} key={page}>
            {page}
          </label>
        </span>
      );
    });
  };

  return (
    <div className="Pagination">
      <button
        type="button"
        className="PreviousPage"
        disabled={state.page === 0}
        onClick={controller.previousPage}
      >
        {'<'}
      </button>
      {renderPageRadioButtons()}
      <button
        type="button"
        className="NextPage"
        disabled={state.page === state.totalPages - 1}
        onClick={controller.nextPage}
      >
        {'>'}
      </button>
    </div>
  );
}
