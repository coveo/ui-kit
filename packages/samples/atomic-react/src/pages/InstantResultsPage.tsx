import type {FunctionComponent} from 'react';
import {AtomicPageWrapper} from '../components/AtomicPageWrapper';

export const InstantResultsPage: FunctionComponent = () => {
  return (
    <AtomicPageWrapper
      sample="electronics"
      options={{recentQueries: true, instantResults: true}}
    >
      <i>👆 Focus on search box to see instant results</i>
    </AtomicPageWrapper>
  );
};
