import React, {FunctionComponent} from 'react';
import {AtomicPageWrapper} from '../components/AtomicPageWrapper';

export const InstantResultsPage: FunctionComponent = () => {
  return (
    <AtomicPageWrapper
      accessToken="xxc23ce82a-3733-496e-b37e-9736168c4fd9"
      organizationId="electronicscoveodemocomo0n2fu8v"
      options={{recentQueries: true, instantResults: true}}
    >
      <p>No result list</p>
    </AtomicPageWrapper>
  );
};
