'use client';

import {buildResultList} from '@coveo/headless';
import {useEffect, useState} from 'react';

// TODO: replace "any" with specific type
export default function ResultList({
  engine,
  controllers,
}: {
  engine: any;
  controllers: any;
}) {
  const controller = buildResultList(engine!);
  const [state, setState] = useState(controller.state);
  useEffect(() => {
    controller.subscribe(() => setState(controller.state));
    // declaring `controller` as a dependency will result in an infinite render loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      Hydrated engine with {state.results.length} results
      <ul>
        {state.results?.map((result) => (
          <li key={result.uniqueId}>
            <a href={result.clickUri}>{result.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
