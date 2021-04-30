import {useEffect, useState, FunctionComponent} from 'react';
import {FoldedResult, Folding as HeadlessFolding} from '@coveo/headless';
import {ResultLink} from '../result-list/result-link';

interface FoldingProps {
  controller: HeadlessFolding;
}

export const FoldedResultList: FunctionComponent<FoldingProps> = (props) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

  const renderFoldedResult = ({result, children}: FoldedResult) => (
    <li key={result.uniqueId}>
      <article>
        <h3>
          {/* Make sure to log analytics when the result link is clicked. */}
          <ResultLink result={result}>{result.title}</ResultLink>
        </h3>
        <p>{result.excerpt}</p>
        <ul>{children.map((child) => renderFoldedResult(child))}</ul>
      </article>
    </li>
  );

  if (!state.collections.length) {
    return <div>No results</div>;
  }

  return (
    <div>
      <ul style={{textAlign: 'left'}}>
        {state.collections.map((collection) => renderFoldedResult(collection))}
      </ul>
    </div>
  );
};

// usage

/**
 * ```tsx
 * const controller = buildFolding(engine);
 *
 * <Folding controller={controller} />;
 * ```
 */
