import {
  AtomicBreadbox,
  AtomicCategoryFacet,
  AtomicColorFacet,
  AtomicDidYouMean,
  AtomicFacet,
  AtomicFacetManager,
  AtomicFormatCurrency,
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
  AtomicSearchBox,
  AtomicSearchInterface,
  AtomicSortDropdown,
  AtomicSortExpression,
  AtomicTableElement,
  AtomicText,
  AtomicTimeframe,
  AtomicTimeframeFacet,
  buildSearchEngine,
  Result,
} from '@coveo/atomic-react';
import './AtomicReactPage.css';

export function AtomicReactPage() {
  const engine = buildSearchEngine({
    configuration: {
      accessToken: 'xxc23ce82a-3733-496e-b37e-9736168c4fd9',
      organizationId: 'electronicscoveodemocomo0n2fu8v',
    },
  });
  return (
    <AtomicSearchInterface
      engine={engine}
      pipeline="Search"
      searchHub="MainSearch"
    >
      <div className="search">
        <AtomicSearchBox />
      </div>
      <AtomicFacetManager>
        <AtomicCategoryFacet field="ec_category" label="Category" withSearch />
        <AtomicFacet field="ec_brand" label="Brand" />
        <AtomicNumericFacet
          field="cat_review_count"
          label="Amount of reviews"
          displayValuesAs="link"
        >
          <AtomicNumericRange start={0} end={150} label="Few" />
          <AtomicNumericRange start={150} end={650} label="A moderate amount" />
          <AtomicNumericRange start={650} end={9999999999} label="A lot" />
        </AtomicNumericFacet>
        <AtomicColorFacet
          field="cat_color"
          label="Color"
          numberOfValues={6}
          sortCriteria="occurrences"
        />
        <AtomicNumericFacet field="ec_price" label="Cost" withInput="integer">
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
      <AtomicBreadbox />
      <div className="topbar">
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
      </div>
      <div className="results">
        <AtomicDidYouMean />
        <AtomicResultList
          fieldsToInclude="ec_price,ec_rating,ec_images,ec_brand,cat_platform,cat_condition,cat_categories,cat_review_count,cat_color"
          display="grid"
          imageSize="large"
          template={MyTemplate}
        />
        <div className="pagination">
          <AtomicLoadMoreResults />
        </div>
        <div className="status">
          <AtomicQueryError />
          <AtomicNoResults />
        </div>
      </div>
    </AtomicSearchInterface>
  );
}

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
