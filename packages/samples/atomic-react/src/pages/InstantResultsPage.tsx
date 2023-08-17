import React, {FunctionComponent} from 'react';
import {AtomicPageWrapper} from '../components/AtomicPageWrapper';

export const InstantResultsPage: FunctionComponent = () => {
  return (
    <AtomicPageWrapper
      sample="electronics"
      options={{recentQueries: true, instantResults: true}}
    >
      <p>No result list</p>
    </AtomicPageWrapper>
  );
};
