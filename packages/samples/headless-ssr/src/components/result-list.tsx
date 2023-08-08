'use client';

import {Result} from '@coveo/headless';

export default function ResultList({results}: {results: Result[]}) {
  return (
    <div>
      <span id="hydrated-msg">
        Hydrated engine with {results?.length} results
      </span>
      <ul>
        {results?.map((result) => (
          <li key={result.uniqueId}>
            <a href={result.clickUri}>{result.title}</a>
          </li>
        ))}
      </ul>
      <div>
        Rendered on{' '}
        <span id="timestamp" suppressHydrationWarning>
          {new Date().toISOString()}
        </span>
      </div>
    </div>
  );
}
