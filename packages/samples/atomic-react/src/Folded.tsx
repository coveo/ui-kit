import React, {FunctionComponent} from 'react';

import {
  AtomicBreadbox,
  AtomicColorFacet,
  AtomicDidYouMean,
  AtomicFacet,
  AtomicFacetManager,
  AtomicFormatCurrency,
  AtomicLayoutSection,
  AtomicLoadMoreResults,
  AtomicNoResults,
  AtomicNumericFacet,
  AtomicNumericRange,
  AtomicQueryError,
  AtomicQuerySummary,
  AtomicRatingFacet,
  AtomicRatingRangeFacet,
  AtomicRefineToggle,
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
  AtomicSearchBox,
  AtomicSearchInterface,
  AtomicSearchLayout,
  AtomicSortDropdown,
  AtomicSortExpression,
  AtomicText,
  AtomicTimeframe,
  AtomicTimeframeFacet,
  buildSearchEngine,
  FoldedResult,
  AtomicResultSectionChildren,
  AtomicFoldedResultList,
  AtomicResultChildren,
  AtomicResultChildrenTemplate,
} from '@coveo/atomic-react';

export const Folded: FunctionComponent = () => {
  const engine = buildSearchEngine({
    configuration: {
      accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
      organizationId: 'searchuisamples',
    },
  });
  return (
    <AtomicSearchInterface
      engine={engine}
      pipeline="Search"
      searchHub="MainSearch"
    >
      <AtomicSearchLayout>
        <AtomicLayoutSection section="search">
          <AtomicSearchBox />
        </AtomicLayoutSection>
        <AtomicLayoutSection section="facets">
          <AtomicFacetManager>
            <AtomicFacet field="source" label="Source" />
            <AtomicFacet field="objecttype" label="Type" />
            <AtomicNumericFacet
              field="cat_review_count"
              label="Amount of reviews"
              displayValuesAs="link"
            >
              <AtomicNumericRange start={0} end={150} label="Few" />
              <AtomicNumericRange
                start={150}
                end={650}
                label="A moderate amount"
              />
              <AtomicNumericRange start={650} end={9999999999} label="A lot" />
            </AtomicNumericFacet>
            <AtomicColorFacet
              field="cat_color"
              label="Color"
              numberOfValues={6}
              sortCriteria="occurrences"
            />
            <AtomicNumericFacet
              field="ec_price"
              label="Cost"
              withInput="integer"
            >
              <AtomicFormatCurrency currency="USD" />
            </AtomicNumericFacet>
            <AtomicTimeframeFacet withDatePicker label="Listed within">
              <AtomicTimeframe unit="hour" />
              <AtomicTimeframe unit="day" />
              <AtomicTimeframe unit="week" />
              <AtomicTimeframe unit="month" />
              <AtomicTimeframe unit="quarter" />
              <AtomicTimeframe unit="year" />
              <AtomicTimeframe unit="year" amount={10} period="next" />
            </AtomicTimeframeFacet>
            <AtomicRatingFacet
              field="ec_rating"
              label="Rating"
              numberOfIntervals={5}
            />
            <AtomicRatingRangeFacet
              field="ec_rating"
              label="Rating Range"
              numberOfIntervals={5}
              facetId="ec_rating_range"
            />
          </AtomicFacetManager>
        </AtomicLayoutSection>
        <AtomicLayoutSection section="main">
          <AtomicLayoutSection section="status">
            <AtomicBreadbox />
            <AtomicQuerySummary enableDuration={false} />
            <AtomicRefineToggle />
            <AtomicSortDropdown>
              <AtomicSortExpression label="relevance" expression="relevancy" />
              <AtomicSortExpression
                label="Price (low to high)"
                expression="ec_price ascending"
              />
              <AtomicSortExpression
                label="Price (high to low)"
                expression="ec_price descending"
              />
            </AtomicSortDropdown>

            <AtomicDidYouMean />
          </AtomicLayoutSection>
          <AtomicLayoutSection section="results">
            <AtomicFoldedResultList
              fieldsToInclude="ec_price,ec_rating,ec_images,ec_brand,cat_platform,cat_condition,cat_categories,cat_review_count,cat_color"
              imageSize="large"
              template={MyTemplate}
            />
            <AtomicQueryError />
            <AtomicNoResults />
          </AtomicLayoutSection>
          <AtomicLayoutSection section="pagination">
            <AtomicLoadMoreResults />
          </AtomicLayoutSection>
        </AtomicLayoutSection>
      </AtomicSearchLayout>
    </AtomicSearchInterface>
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
