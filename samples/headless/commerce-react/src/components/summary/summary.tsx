import type {Summary as HeadlessSummary} from '@coveo/headless/commerce';
import {useEffect, useState} from 'react';

interface ISummaryProps {
  controller: HeadlessSummary;
}

export default function Summary(props: ISummaryProps) {
  const {controller} = props;

  const [state, setState] = useState(controller.state);

  useEffect(() => {
    controller.subscribe(() => setState(controller.state));
  }, [controller]);

  const renderQuerySummary = () => {
    if (!('query' in state) || state.query === '') {
      return null;
    }

    return (
      <span>
        {' '}
        for query <b>{state.query as string}</b>
      </span>
    );
  };

  const renderSummary = () => {
    if (state.isLoading) {
      return <span>Loading...</span>;
    }

    const {firstProduct, lastProduct, totalNumberOfProducts} = state;
    return (
      <span>
        Showing products {firstProduct} - {lastProduct} of{' '}
        {totalNumberOfProducts}
        {renderQuerySummary()}
      </span>
    );
  };

  return <div className="Summary">{renderSummary()}</div>;
}
