'use client';

import {Result} from '@coveo/headless';

export default function ResultList({results}: {results: Result[]}) {
  return (
    <div>
      Hydrated engine with {results?.length} results
      <ul>
        {results?.map((result) => (
          <li key={result.uniqueId}>
            <a href={result.clickUri}>{result.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
