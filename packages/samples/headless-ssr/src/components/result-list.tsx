import {
  ResultList as ResultListController,
  ResultListState,
} from '@coveo/headless';
import {useEffect, useState, FunctionComponent} from 'react';

interface ResultListProps {
  initialState: ResultListState;
  controller?: ResultListController;
}

export const ResultList: FunctionComponent<ResultListProps> = (props) => {
  const {initialState, controller} = props;
  const [state, setState] = useState(initialState);

  useEffect(
    () => controller?.subscribe(() => setState({...controller.state})),
    [controller]
  );

  if (!state.results.length) {
    return <div>No results</div>;
  }

  return (
    <div>
      <span id="hydrated-msg">
        Hydrated engine with {state.results.length} results
      </span>
      <ul style={{textAlign: 'left'}}>
        {state.results.map((result) => (
          <li key={result.uniqueId}>
            <article>
              <h3>{result.title}</h3>
              <p>{result.excerpt}</p>
            </article>
          </li>
        ))}
      </ul>
      <div>
        Rendered on{' '}
        <span id="timestamp" suppressHydrationWarning>
          {new Date().toISOString()}
        </span>
      </div>
    </div>
  );
};
