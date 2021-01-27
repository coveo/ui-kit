import {useEffect, useState, FunctionComponent} from 'react';
import {
  buildResultList,
  ResultList as HeadlessResultList,
} from '@coveo/headless';
import {engine} from '../../engine';

interface ResultListProps {
  controller: HeadlessResultList;
}

export const ResultList: FunctionComponent<ResultListProps> = (props) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

  const showMore = () => {
    controller.fetchMoreResults();
  };

  const resultsAvailable = () => {
    return state.results.length > 0;
  };

  const results = () => {
    return state.results.map((result) => (
      <li key={result.uniqueId}>
        <article>
          <h2>
            <a href={result.clickUri}>{result.title}</a>
          </h2>
          <p>{result.excerpt}</p>
        </article>
      </li>
    ));
  };

  return (
    <div>
      <ul>{resultsAvailable() ? results() : <li>No results</li>}</ul>
      {resultsAvailable() && (
        <button onClick={() => showMore()} disabled={state.isLoading}>
          Show more
        </button>
      )}
    </div>
  );
};

// usage

const controller = buildResultList(engine);

<ResultList controller={controller} />;
