import {
  Summary as HeadlessSummary,
  ProductListingSummaryState,
  SearchSummaryState,
  RecommendationsSummaryState,
} from '@coveo/headless/ssr-commerce';
import {useEffect, useState} from 'react';

interface ISummaryProps {
  controller?: HeadlessSummary;
  staticState:
    | ProductListingSummaryState
    | SearchSummaryState
    | RecommendationsSummaryState;
}

export default function Summary(props: ISummaryProps) {
  const {controller, staticState} = props;

  const [state, setState] = useState(staticState);

  useEffect(() => {
    controller?.subscribe(() => setState(controller.state));
  }, [controller]);

  const renderBaseSummary = () => {
    const {firstProduct, lastProduct, totalNumberOfProducts} = state;
    return (
      <span>
        Showing results {firstProduct} - {lastProduct} of{' '}
        {totalNumberOfProducts}
      </span>
    );
  };

  const renderQuerySummary = () => {
    if (!('query' in state)) {
      return null;
    }

    return (
      <span>
        for <b>{state.query}</b>
      </span>
    );
  };

  const renderSummary = () => {
    return (
      <p>
        {renderBaseSummary()}
        {renderQuerySummary()}
      </p>
    );
  };

  return <div className="Summary">{renderSummary()}</div>;
}
