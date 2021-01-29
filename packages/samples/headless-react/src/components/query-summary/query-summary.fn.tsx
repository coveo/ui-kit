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

  const {
    hasQuery,
    firstResult,
    lastResult,
    total,
    query,
    durationInSeconds,
  } = state;
  return hasQuery ? (
    <p>
      Results {firstResult}-{lastResult} of {total} for {query} in{' '}
      {durationInSeconds} seconds
    </p>
  ) : null;
};

// usage

const controller = buildQuerySummary(engine);

<QuerySummary controller={controller} />;
