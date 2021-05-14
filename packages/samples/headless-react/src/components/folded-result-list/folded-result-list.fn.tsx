import {useEffect, useState, FunctionComponent} from 'react';
import {
  Collection,
  FoldedResult,
  FoldedResultList as HeadlessFoldedResultList,
  Result,
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

  function isFoldedResult(
    result: Collection | FoldedResult | Result
  ): result is Collection | FoldedResult {
    return 'children' in result;
  }

  function isCollection(
    result: Collection | FoldedResult | Result
  ): result is Collection {
    return 'moreResultsAvailable' in result;
  }

  function renderFoldedResult(result: Collection | FoldedResult | Result) {
    return (
      <li key={result.uniqueId}>
        <article>
          <h3>
            {/* Make sure to log analytics when the result link is clicked. */}
            <ResultLink result={result}>{result.title}</ResultLink>
          </h3>
          <p>{result.excerpt}</p>
          <ul>
            {isFoldedResult(result) &&
              result.children.map((child) => renderFoldedResult(child))}
          </ul>
          {isCollection(result) && result.moreResultsAvailable ? (
            <button
              disabled={result.isLoadingMoreResults}
              onClick={() => controller.loadCollection(result)}
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
