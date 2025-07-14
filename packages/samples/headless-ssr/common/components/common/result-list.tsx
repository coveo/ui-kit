import type {Result} from '@coveo/headless/ssr';

interface ResultListCommonProps {
  results: Result[];
}

export default function ResultListCommon({results}: ResultListCommonProps) {
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
