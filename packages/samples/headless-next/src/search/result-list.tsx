'use client';

import {FunctionComponent} from 'react';
import {useResultList} from '@/common/engine-definition.client';

export const ResultList: FunctionComponent = () => {
  const {state} = useResultList();

  return (
    <ul>
      {state.results.map((result) => (
        <li key={result.uniqueId}>{result.title}</li>
      ))}
    </ul>
  );
};
