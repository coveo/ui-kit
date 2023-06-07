'use client';

import {useClientSearchEngine} from '@/context/engine';
import {useController} from '@/hooks/use-controller';
import {ResultListProps, buildResultList} from '@coveo/headless';
import {FunctionComponent} from 'react';
import {StaticResultList} from './result-list.common';

export const InteractiveResultList: FunctionComponent<{
  props?: ResultListProps;
}> = ({props}) => {
  const engine = useClientSearchEngine();
  const {state} = useController(buildResultList, engine, props ?? {});

  return <StaticResultList state={state} />;
};
