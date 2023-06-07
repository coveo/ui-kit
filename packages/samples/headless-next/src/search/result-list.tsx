import {ResultListProps, ResultListState} from '@coveo/headless';
import {FunctionComponent, Suspense} from 'react';
import {InteractiveResultList} from './result-list.client';
import {StaticResultList} from './result-list.common';

export const ResultList: FunctionComponent<{
  initialState: ResultListState;
  props?: ResultListProps;
}> = ({initialState, props}) => (
  <Suspense fallback={<StaticResultList state={initialState} />}>
    <InteractiveResultList props={props} />
  </Suspense>
);
