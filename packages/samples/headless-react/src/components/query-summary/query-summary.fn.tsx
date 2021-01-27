import {useEffect, useState, FunctionComponent} from 'react';
import {
  buildQuerySummary,
  QuerySummary as HeadlessQuerySummary,
} from '@coveo/headless';
import {engine} from '../../engine';

interface QuerySummaryProps {
  controller: HeadlessQuerySummary;
}

export const QuerySummary: FunctionComponent<QuerySummaryProps> = (props) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

  return state.hasQuery ? (
    <p>
      Results {state.firstResult}-{state.lastResult} of{' '}
      <strong>{state.total}</strong> for <strong>{state.query}</strong> in{' '}
      {state.durationInSeconds.toLocaleString()} seconds
    </p>
  ) : null;
};

// usage

const controller = buildQuerySummary(engine);

<QuerySummary controller={controller} />;
