'use client';

import {hydrateInitialState} from '@/engine';
import {buildResultList} from '@coveo/headless';
import {useEffect, useState} from 'react';

export default function SearchPage({engineSnapshot}: {engineSnapshot: any}) {
  const {engine, controllers} = hydrateInitialState(engineSnapshot);
  const controller = buildResultList(engine!);
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

  return (
    <>
      <div>Hydrated engine with {state.results.length} results</div>
      <div>
        <ul style={{textAlign: 'left'}}>
          {state.results?.map((result) => (
            <li key={result.uniqueId}>
              <p>{result.title}</p>
              <p>{result.excerpt}</p>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
