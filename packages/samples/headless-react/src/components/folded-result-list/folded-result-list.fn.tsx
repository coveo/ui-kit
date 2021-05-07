import {useEffect, useState, FunctionComponent} from 'react';
import {
  Collection,
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

  function isCollection(
    result: Collection | FoldedResult
  ): result is Collection {
    return 'moreResultsAvailable' in result;
  }

  function renderFoldedResult(result: Collection | FoldedResult) {
    return (
      <li key={result.uniqueId}>
        <article>
          <h3>
            {/* Make sure to log analytics when the result link is clicked. */}
            <ResultLink result={result}>{result.title}</ResultLink>
          </h3>
          <p>{result.excerpt}</p>
          <ul>{result.children.map((child) => renderFoldedResult(child))}</ul>
          {isCollection(result) && result.moreResultsAvailable ? (
            <button
              disabled={result.isLoadingMoreResults}
              onClick={() => controller.loadAll(result)}
            >
              Show more
            </button>
          ) : null}
        </article>
      </li>
    );
  }

  if (!state.results.length) {
    return <div>No results</div>;
  }

  return (
    <div>
      <ul style={{textAlign: 'left'}}>
        {state.results.map((result) => renderFoldedResult(result))}
      </ul>
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
