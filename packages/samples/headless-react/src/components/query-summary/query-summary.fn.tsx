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
    hasResults,
    hasQuery,
    hasDuration,
    firstResult,
    lastResult,
    total,
    query,
    durationInSeconds,
  } = state;

  if (!hasResults) {
    return null;
  }

  const summary = [`Results ${firstResult}-${lastResult} of ${total}`];

  if (hasQuery) {
    summary.push(`for ${query}`);
  }

  if (hasDuration) {
    summary.push(`in ${durationInSeconds} seconds`);
  }

  return <p>{summary.join(' ')}</p>;
};

// usage

const controller = buildQuerySummary(engine);

<QuerySummary controller={controller} />;
