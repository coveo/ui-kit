import React, {FunctionComponent} from 'react';

import {
  AtomicFormatCurrency,
  AtomicResultBadge,
  AtomicResultDate,
  AtomicResultFieldsList,
  AtomicResultImage,
  AtomicResultLink,
  AtomicResultList,
  AtomicResultMultiValueText,
  AtomicResultNumber,
  AtomicResultPrintableUri,
  AtomicResultRating,
  AtomicResultSectionBadges,
  AtomicResultSectionBottomMetadata,
  AtomicResultSectionEmphasized,
  AtomicResultSectionExcerpt,
  AtomicResultSectionTitle,
  AtomicResultSectionTitleMetadata,
  AtomicResultSectionVisual,
  AtomicResultText,
  AtomicText,
  Result,
} from '@coveo/atomic-react';
import {AtomicPageWrapper} from '../components/AtomicPageWrapper';

export const ResultListPage: FunctionComponent = () => {
  return (
    <AtomicPageWrapper
      accessToken="xxc23ce82a-3733-496e-b37e-9736168c4fd9"
      organizationId="electronicscoveodemocomo0n2fu8v"
    >
      <AtomicResultList
        display="grid"
        imageSize="large"
        template={MyTemplate}
      />
    </AtomicPageWrapper>
  );
};

function MyTemplate(result: Result) {
  return (
    <>
      <AtomicResultSectionBadges>
        <AtomicResultBadge field="ec_brand" />
      </AtomicResultSectionBadges>
      <AtomicResultSectionVisual>
        <AtomicResultImage field="ec_images" />
      </AtomicResultSectionVisual>
      <AtomicResultSectionTitle>
        <AtomicResultLink />
      </AtomicResultSectionTitle>
      <AtomicResultSectionTitleMetadata>
        <AtomicResultRating field="ec_rating" />
        <AtomicResultPrintableUri maxNumberOfParts={3} />
      </AtomicResultSectionTitleMetadata>
      <AtomicResultSectionEmphasized>
        <AtomicResultNumber field="ec_price">
          <AtomicFormatCurrency currency="USD" />
        </AtomicResultNumber>
      </AtomicResultSectionEmphasized>
      <AtomicResultSectionExcerpt>
        <AtomicResultText field="ec_shortdesc" />
      </AtomicResultSectionExcerpt>
      <AtomicResultSectionBottomMetadata>
        <AtomicResultFieldsList>
          <AtomicResultDate format="ddd MMM D YYYY" />
          {result.raw.cat_platform !== undefined && (
            <>
              <span className="field-label">
                <AtomicText value="Platform" />
              </span>
              <AtomicResultText field="cat_platform" />
            </>
          )}
          {result.raw.cat_condition !== undefined && (
            <>
              <span className="field-label">
                <AtomicText value="Condition" />
              </span>
              <AtomicResultText field="cat_condition" />
            </>
          )}
          {result.raw.cat_categories !== undefined && (
            <>
              <span className="field-label">
                <AtomicText value="Tags" />
              </span>
              <AtomicResultMultiValueText field="cat_categories" />
            </>
          )}
        </AtomicResultFieldsList>
      </AtomicResultSectionBottomMetadata>
    </>
  );
}
