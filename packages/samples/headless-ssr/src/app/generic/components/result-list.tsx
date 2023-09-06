import {
  ResultList as ResultListController,
  ResultListState,
} from '@coveo/headless';
import {useEffect, useState, FunctionComponent} from 'react';

interface ResultListProps {
  ssrState: ResultListState;
  controller?: ResultListController;
}

export const ResultList: FunctionComponent<ResultListProps> = ({
  ssrState,
  controller,
}) => {
  const [state, setState] = useState(ssrState);

  useEffect(
    () => controller?.subscribe(() => setState({...controller.state})),
    [controller]
  );

  return (
    <ul className="result-list">
      {state.results.map((result) => (
        <li key={result.uniqueId}>
          <h3>{result.title}</h3>
        </li>
      ))}
    </ul>
  );
};
