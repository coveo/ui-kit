import {useEffect, useState, FunctionComponent} from 'react';
import {
  buildResultList,
  ResultList as HeadlessResultList,
} from '@coveo/headless';
import {engine} from '../../engine';
import {ResultLink} from './result-link';

interface ResultListProps {
  controller: HeadlessResultList;
}

export const ResultList: FunctionComponent<ResultListProps> = (props) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

  if (!state.results.length) {
    return <div>No results</div>;
  }

  return (
    <div>
      <ul style={{textAlign: 'left'}}>
        {state.results.map((result) => (
          <li key={result.uniqueId}>
            <article>
              <h2>
                {/* Make sure to log analytics when the result link is clicked. */}
                <ResultLink result={result}>{result.title}</ResultLink>
              </h2>
              <p>{result.excerpt}</p>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
};

// usage

const controller = buildResultList(engine);

<ResultList controller={controller} />;
