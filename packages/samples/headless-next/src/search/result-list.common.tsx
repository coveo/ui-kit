import {ResultListState} from '@coveo/headless';
import {FunctionComponent} from 'react';

export const StaticResultList: FunctionComponent<{state: ResultListState}> = ({
  state,
}) => (
  <ul>
    {state.results.map((result) => (
      <li key={result.uniqueId}>{result.title}</li>
    ))}
  </ul>
);
