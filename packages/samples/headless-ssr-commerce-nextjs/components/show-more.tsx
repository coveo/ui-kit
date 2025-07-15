'use client';

import {usePagination, useSummary} from '@/lib/commerce-engine';

export default function ShowMore() {
  const {state, methods} = usePagination();
  const {state: summaryState} = useSummary();

  const handleFetchMore = () => {
    methods?.fetchMoreProducts();
  };

  const isDisabled = () => {
    return (
      !methods ||
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
        type="button"
        className="ShowMore"
        disabled={isDisabled()}
        onClick={() => handleFetchMore()}
      >
        Show more
      </button>
    </>
  );
}
