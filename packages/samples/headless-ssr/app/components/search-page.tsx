'use client';

import {hydrateInitialState} from '@/app/common/engine';
import {buildResultList} from '@coveo/headless';
import {useEffect, useState} from 'react';

export default function SearchPage({engineSnapshot}: {engineSnapshot: any}) {
  const {engine, controllers} = hydrateInitialState(engineSnapshot);
  const controller = buildResultList(engine!);
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

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
