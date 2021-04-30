import {useEffect, useState, FunctionComponent} from 'react';
import {
  FoldedResult,
  FoldedResultList as HeadlessFoldedResultList,
} from '@coveo/headless';
import {ResultLink} from '../result-list/result-link';

interface FoldedResultListProps {
  controller: HeadlessFoldedResultList;
}

export const FoldedResultList: FunctionComponent<FoldedResultListProps> = (
  props
) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

  const renderFoldedResult = (result: FoldedResult) => (
    <li key={result.uniqueId}>
      <article>
        <h3>
          {/* Make sure to log analytics when the result link is clicked. */}
          <ResultLink result={result}>{result.title}</ResultLink>
        </h3>
        <p>{result.excerpt}</p>
        <ul>{result.children.map((child) => renderFoldedResult(child))}</ul>
      </article>
    </li>
  );

  if (!state.results.length) {
    return <div>No results</div>;
  }

  return (
    <div>
      <ul style={{textAlign: 'left'}}>
        {state.results.map((result) => renderFoldedResult(result))}
      </ul>
      <button
        disabled={state.isLoading}
        onClick={() => controller.fetchMoreResults()}
      >
        Fetch
      </button>
    </div>
  );
};

// usage

/**
 * ```tsx
 * const controller = buildFoldedResultList(engine);
 *
 * <FoldedResultList controller={controller} />;
 * ```
 */
