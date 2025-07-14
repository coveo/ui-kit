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
import type {FunctionComponent} from 'react';
import {AtomicPageWrapper} from '../components/AtomicPageWrapper';

export const TableResultListPage: FunctionComponent = () => {
  return (
    <AtomicPageWrapper sample="electronics">
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
