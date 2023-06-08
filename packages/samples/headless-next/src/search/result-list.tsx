'use client';

import {useClientSearchEngine} from '@/context/engine';
import {useController} from '@/hooks/use-controller';
import {ResultListProps, buildResultList} from '@coveo/headless';
import {FunctionComponent} from 'react';

export const ResultList: FunctionComponent<{
  props?: ResultListProps;
}> = ({props}) => {
  const engine = useClientSearchEngine();
  const {state} = useController(buildResultList, engine, props ?? {});

  return (
    <ul>
      {state.results.map((result) => (
        <li key={result.uniqueId}>{result.title}</li>
      ))}
    </ul>
  );
};
