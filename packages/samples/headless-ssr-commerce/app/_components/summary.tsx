import {
  Summary as HeadlessSummary,
  SearchSummaryState,
  ProductListingSummaryState,
  RecommendationsSummaryState,
} from '@coveo/headless/commerce';
import {useEffect, useState} from 'react';

interface ISummaryProps {
  controller?: HeadlessSummary;
  staticState:
    | SearchSummaryState
    | ProductListingSummaryState
    | RecommendationsSummaryState;
}

export default function Summary(props: ISummaryProps) {
  const {controller, staticState} = props;

  const [state, setState] = useState(staticState);

  useEffect(() => {
    controller?.subscribe(() => setState(controller.state));
  }, [controller]);

  const getQuerySummary = () => {
    if (!('query' in state)) {
      return null;
    }

    return (
      <>
        for <b>{state.query}</b>
      </>
    );
  };

  const renderSummary = () => {
    const {firstProduct, lastProduct, totalNumberOfProducts} = state;
    return (
      <span>
        Showing results {firstProduct} - {lastProduct} of{' '}
        {totalNumberOfProducts}
        {getQuerySummary()}
      </span>
    );
  };

  return <div className="Summary">{renderSummary()}</div>;
}
