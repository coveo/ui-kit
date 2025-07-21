import type {Pagination, Summary} from '@coveo/headless/commerce';
import {useEffect, useState} from 'react';

interface IShowMoreProps {
  controller: Pagination;
  summaryController: Summary;
}

export default function ShowMore(props: IShowMoreProps) {
  const {controller, summaryController} = props;

  const [summaryState, setSummaryState] = useState(summaryController.state);

  useEffect(() => {
    summaryController.subscribe(() => setSummaryState(summaryController.state));
  }, [summaryController]);

  const handleFetchMore = () => {
    controller.fetchMoreProducts();
  };

  const isDisabled = () => {
    return summaryState.lastProduct === summaryState.totalNumberOfProducts;
  };

  return (
    <button
      type="button"
      className="ShowMore"
      disabled={isDisabled()}
      onClick={() => handleFetchMore()}
    >
      Show more
    </button>
  );
}
