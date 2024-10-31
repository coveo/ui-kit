'use client';

import {usePagination, useSummary} from '../_lib/commerce-engine';

export default function ShowMore() {
  const {state, controller} = usePagination();
  const {state: summaryState} = useSummary();

  const handleFetchMore = () => {
    controller?.fetchMoreProducts();
  };

  const isDisabled = () => {
    return (
      !controller ||
      summaryState?.lastProduct === summaryState?.totalNumberOfProducts
    );
  };

  return (
    <>
      <div>
        Displaying {summaryState?.lastProduct ?? state.pageSize} out of{' '}
        {state.totalEntries} products
      </div>
      <button
        className="ShowMore"
        disabled={isDisabled()}
        onClick={() => handleFetchMore()}
      >
        Show more
      </button>
    </>
  );
}
