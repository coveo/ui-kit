import type {ResultList as ResultListController} from '@coveo/headless';
import {useController} from '../use-controller';

interface ResultListProps {
  controller: ResultListController;
}

export function ResultList({controller}: ResultListProps) {
  const {results, isLoading} = useController(controller);

  if (!isLoading && results.length === 0) {
    return <p className="result-list__empty">No results found.</p>;
  }

  return (
    <ol className="result-list">
      {results.map((result) => (
        <li className="result" key={result.uniqueId}>
          <a
            className="result__title"
            href={result.clickUri}
            target="_blank"
            rel="noreferrer"
          >
            {result.title}
          </a>
          {result.excerpt && (
            <p className="result__excerpt">{result.excerpt}</p>
          )}
        </li>
      ))}
    </ol>
  );
}
