import React, {FunctionComponent} from 'react';

import {
  AtomicFormatCurrency,
  AtomicResultBadge,
  AtomicResultFieldsList,
  AtomicResultImage,
  AtomicResultLink,
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
  FoldedResult,
  AtomicResultSectionChildren,
  AtomicFoldedResultList,
  AtomicResultChildren,
  AtomicResultChildrenTemplate,
} from '@coveo/atomic-react';
import {AtomicPageWrapper} from '../components/AtomicPageWrapper';

export const FoldedResultListPage: FunctionComponent = () => {
  return (
    <AtomicPageWrapper
      accessToken="xx564559b1-0045-48e1-953c-3addd1ee4457"
      organizationId="searchuisamples"
    >
      <AtomicFoldedResultList
        fieldsToInclude="ec_price,ec_rating,ec_images,ec_brand,cat_platform,cat_condition,cat_categories,cat_review_count,cat_color"
        imageSize="large"
        template={MyTemplate}
      />
    </AtomicPageWrapper>
  );
};

function MyTemplate(result: FoldedResult) {
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
      <AtomicResultSectionChildren>
        <AtomicResultChildren>
          <AtomicResultChildrenTemplate>
            <template>
              <AtomicResultLink />
            </template>
          </AtomicResultChildrenTemplate>
        </AtomicResultChildren>
      </AtomicResultSectionChildren>
      <AtomicResultSectionBottomMetadata>
        <AtomicResultFieldsList>
          {result.result.raw.cat_platform && (
            <>
              <span className="field-label">
                <AtomicText value="Platform" />
              </span>
              <AtomicResultText field="cat_platform" />
            </>
          )}
          {result.result.raw.cat_condition && (
            <>
              <span className="field-label">
                <AtomicText value="Condition" />
              </span>
              <AtomicResultText field="cat_condition" />
            </>
          )}
          {result.result.raw.cat_categories && (
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
