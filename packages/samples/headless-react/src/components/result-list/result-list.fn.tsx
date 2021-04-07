import {useEffect, useState, useContext, FunctionComponent} from 'react';
import {
  ResultList as HeadlessResultList,
  buildQuickview,
} from '@coveo/headless';
import {ResultLink} from './result-link';
import {Quickview} from '../quickview/quickview.fn';
import {AppContext} from '../../context/engine';

interface ResultListProps {
  controller: HeadlessResultList;
}

export const ResultList: FunctionComponent<ResultListProps> = (props) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);
  const {engine} = useContext(AppContext);

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
              <h3>
                {/* Make sure to log analytics when the result link is clicked. */}
                <ResultLink result={result}>{result.title}</ResultLink>
              </h3>
              <p>{result.excerpt}</p>
              <div>
                <Quickview
                  controller={buildQuickview(engine!, {options: {result}})}
                />
              </div>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
};

// usage

/**
 * ```tsx
 * const controller = buildResultList(engine);
 *
 * <ResultList controller={controller} />;
 * ```
 */
