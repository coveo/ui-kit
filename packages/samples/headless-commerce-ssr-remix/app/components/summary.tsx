import {useSummary} from '@/lib/commerce-engine';

export default function Summary() {
  const {state} = useSummary();

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

  return (
    <div>
      <span>
        Products <b>{state.firstProduct}</b>-<b>{state.lastProduct}</b> of{' '}
        <b>{state.totalNumberOfProducts}</b>
      </span>
      {renderQuerySummary()}
    </div>
  );
}
