'use client';

import {useSummary} from '../_lib/commerce-engine';

export default function Summary() {
  const {state} = useSummary();

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

    // TODO: add query to summary state
    // return (
    //   <span>
    //     for <b>{state.query}</b>
    //   </span>
    // );
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
