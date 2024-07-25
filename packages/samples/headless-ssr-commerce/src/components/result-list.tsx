import {
  ResultList as ResultListController,
  ResultListState,
} from '@coveo/headless/ssr';
import {useEffect, useState, FunctionComponent} from 'react';

interface ResultListProps {
  staticState: ResultListState;
  controller?: ResultListController;
}

export const ResultList: FunctionComponent<ResultListProps> = ({
  staticState,
  controller,
}) => {
  const [state, setState] = useState(staticState);

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
