import type {Result} from '@coveo/headless/ssr-next';

export default function ResultListCommon({results}: {results: Result[]}) {
  return (
    <ul className="result-list">
      {results.map((result) => (
        <li key={result.uniqueId}>
          <h3>{result.title}</h3>
        </li>
      ))}
    </ul>
  );
}
