import React, {FunctionComponent} from 'react';
import {AtomicResultLink, AtomicResultList} from '@coveo/atomic-react';
import {AtomicPageWrapper} from '../components/AtomicPageWrapper';

export const InstantResultsPage: FunctionComponent = () => {
  return (
    <AtomicPageWrapper
      accessToken="xxc23ce82a-3733-496e-b37e-9736168c4fd9"
      organizationId="electronicscoveodemocomo0n2fu8v"
      options={{recentQueries: true, instantResults: true}}
    >
      <AtomicResultList
        fieldsToInclude="ec_price,ec_rating,ec_images,ec_brand,cat_platform,cat_condition,cat_categories,cat_review_count,cat_color"
        display="grid"
        imageSize="large"
        template={() => <AtomicResultLink />}
      />
    </AtomicPageWrapper>
  );
};
