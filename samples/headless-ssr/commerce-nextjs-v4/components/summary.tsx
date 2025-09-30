'use client';

import {useSummary} from '@/lib/commerce-engine';

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
    if (!('query' in state) || state.query.trim() === '') {
      return null;
    }

    return (
      <span>
        {' '}
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
