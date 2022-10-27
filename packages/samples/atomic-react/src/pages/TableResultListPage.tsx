import React, {FunctionComponent} from 'react';

import {
  AtomicFormatCurrency,
  AtomicResultBadge,
  AtomicResultImage,
  AtomicResultList,
  AtomicResultNumber,
  AtomicResultPrintableUri,
  AtomicResultRating,
  AtomicResultSectionBadges,
  AtomicResultSectionEmphasized,
  AtomicResultSectionTitle,
  AtomicResultSectionTitleMetadata,
  AtomicResultSectionVisual,
  AtomicResultText,
  AtomicTableElement,
} from '@coveo/atomic-react';
import {AtomicPageWrapper} from '../components/AtomicPageWrapper';

export const TableResultListPage: FunctionComponent = () => {
  return (
    <AtomicPageWrapper
      accessToken="xxc23ce82a-3733-496e-b37e-9736168c4fd9"
      organizationId="electronicscoveodemocomo0n2fu8v"
    >
      <AtomicResultList
        display="table"
        imageSize="large"
        template={MyTemplate}
      />
    </AtomicPageWrapper>
  );
};

function MyTemplate() {
  return (
    <>
      <AtomicTableElement label="Image">
        <AtomicResultSectionVisual>
          <AtomicResultImage field="ec_images"></AtomicResultImage>
        </AtomicResultSectionVisual>
      </AtomicTableElement>
      <AtomicTableElement label="Product description">
        <AtomicResultSectionBadges>
          <AtomicResultBadge field="cat_condition"></AtomicResultBadge>
        </AtomicResultSectionBadges>
        <AtomicResultSectionTitle>
          <AtomicResultText field="title"></AtomicResultText>
        </AtomicResultSectionTitle>
        <AtomicResultSectionTitleMetadata>
          <AtomicResultPrintableUri maxNumberOfParts={3} />
          <AtomicResultRating field="ec_rating" />
        </AtomicResultSectionTitleMetadata>
        <AtomicResultSectionEmphasized>
          <AtomicResultNumber field="ec_price">
            <AtomicFormatCurrency currency="USD" />
          </AtomicResultNumber>
        </AtomicResultSectionEmphasized>
      </AtomicTableElement>
      <AtomicTableElement label="Brand">
        <AtomicResultText field="ec_brand"></AtomicResultText>
      </AtomicTableElement>
    </>
  );
}
