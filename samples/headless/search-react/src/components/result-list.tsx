import type {
  ResultList as ResultListController,
  SearchEngine,
} from '@coveo/headless';
import {useController} from '../use-controller';
import {ResultLink} from './result-link';

interface ResultListProps {
  engine: SearchEngine;
  controller: ResultListController;
}

export function ResultList({engine, controller}: ResultListProps) {
  const {results, isLoading} = useController(controller);

  if (!isLoading && results.length === 0) {
    return <p className="result-list__empty">No results found.</p>;
  }

  return (
    <ol className="result-list">
      {results.map((result) => (
        <li className="result" key={result.uniqueId}>
          <ResultLink engine={engine} result={result}>
            {result.title}
          </ResultLink>
          {result.excerpt && (
            <p className="result__excerpt">{result.excerpt}</p>
          )}
        </li>
      ))}
    </ol>
  );
}
