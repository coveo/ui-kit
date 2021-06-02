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

  function renderFoldedResults(results: FoldedResult[]) {
    return results.map(({result, children}) => (
      <li key={result.uniqueId}>
        <article>
          <h3>
            {/* Make sure to log analytics when the result link is clicked. */}
            <ResultLink result={result}>{result.title}</ResultLink>
          </h3>
          <p>{result.excerpt}</p>
          <ul>{renderFoldedResults(children)}</ul>
        </article>
      </li>
    ));
  }

  if (!state.results.length) {
    return <div>No results</div>;
  }

  return (
    <div>
      <ul style={{textAlign: 'left'}}>
        {state.results.map((collection) => (
          <li key={collection.result.uniqueId}>
            <article>
              <h3>
                {/* Make sure to log analytics when the result link is clicked. */}
                <ResultLink result={collection.result}>
                  {collection.result.title}
                </ResultLink>
              </h3>
              <p>{collection.result.excerpt}</p>
              <ul>{renderFoldedResults(collection.children)}</ul>
              {collection.moreResultsAvailable && (
                <button
                  disabled={collection.isLoadingMoreResults}
                  onClick={() => controller.loadCollection(collection)}
                >
                  Show more
                </button>
              )}
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
 * const controller = buildFoldedResultList(engine);
 *
 * <FoldedResultList controller={controller} />;
 * ```
 */
