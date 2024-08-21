import {
  Pagination as HeadlessPagination,
  PaginationState,
  Summary,
} from '@coveo/headless/ssr-commerce';
import {useEffect, useState} from 'react';

interface IShowMoreProps {
  staticState: PaginationState;
  summaryController?: Summary;
  controller?: HeadlessPagination;
}

export default function ShowMore(props: IShowMoreProps) {
  const {controller, summaryController, staticState} = props;

  const [state, setState] = useState(staticState);
  const [summaryState, setSummaryState] = useState(
    props.summaryController?.state
  );

  useEffect(() => {
    controller?.subscribe(() => setState(controller.state));
  }, [controller]);

  useEffect(() => {
    summaryController?.subscribe(() =>
      setSummaryState(summaryController.state)
    );
  }, [summaryController]);

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
