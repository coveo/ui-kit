import {usePagination, useSummary} from '@/lib/commerce-engine';

export default function ShowMore() {
  const {state, methods} = usePagination();
  const {state: summaryState} = useSummary();

  const handleClick = () => {
    if (!methods) {
      return;
    }

    methods.fetchMoreProducts();
  };

  const isDisabled = () => {
    return (
      !methods ||
      summaryState?.lastProduct === summaryState?.totalNumberOfProducts
    );
  };

  return (
    <div>
      <label htmlFor="load-more-progress">
        <div>
          Showing
          <span>
            <b> {summaryState?.lastProduct ?? state.pageSize} </b>
          </span>
          of
          <span>
            <b> {state.totalEntries} </b>
          </span>
          products
        </div>
      </label>
      <progress
        id="load-more-progress"
        value={summaryState?.lastProduct ?? state.pageSize}
        max={state.totalEntries}
      ></progress>
      <div>
        <button disabled={isDisabled()} onClick={handleClick}>
          Load more products
        </button>
      </div>
    </div>
  );
}
