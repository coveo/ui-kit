import {usePagination} from '@/lib/commerce-engine';

export default function Pagination() {
  const {state, methods} = usePagination();

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
            onChange={() => methods?.selectPage(page - 1)}
          />
          {page}
        </label>
      );
    });
  };

  return (
    <div className="Pagination">
      <div>
        Page {state.page + 1} of {state.totalPages}
      </div>
      <button
        type="button"
        className="PreviousPage"
        disabled={state.page === 0}
        onClick={methods?.previousPage}
      >
        {'<'}
      </button>
      {renderPageRadioButtons()}
      <button
        type="button"
        className="NextPage"
        disabled={state.page === state.totalPages - 1}
        onClick={methods?.nextPage}
      >
        {'>'}
      </button>
    </div>
  );
}
