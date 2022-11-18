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
  AtomicSearchBox,
  AtomicSearchInterface,
  AtomicSearchLayout,
  AtomicSortDropdown,
  AtomicSortExpression,
  AtomicTimeframe,
  AtomicTimeframeFacet,
  AtomicSearchBoxInstantResults,
  buildSearchEngine,
  AtomicSearchBoxRecentQueries,
  AtomicResultSectionVisual,
  AtomicResultImage,
  AtomicResultSectionTitle,
  AtomicResultLink,
  AtomicResultSectionTitleMetadata,
  AtomicResultRating,
  AtomicResultNumber,
  Result,
  Bindings,
  AtomicSearchBoxQuerySuggestions,
} from '@coveo/atomic-react';
import React, {FunctionComponent} from 'react';

type Options = {
  instantResults?: boolean;
  recentQueries?: boolean;
};
type Props = {
  accessToken: string;
  organizationId: string;
  children: React.ReactNode;
  options?: Options;
};

export const AtomicPageWrapper: FunctionComponent<Props> = ({
  accessToken,
  organizationId,
  children,
  options = {},
}) => {
  const engine = buildSearchEngine({
    configuration: {
      accessToken,
      organizationId,
    },
  });
  return (
    <AtomicSearchInterface
      engine={engine}
      pipeline="Search"
      searchHub="MainSearch"
      fieldsToInclude="ec_price,ec_rating,ec_images,ec_brand,cat_platform,cat_condition,cat_categories,cat_review_count,cat_color"
      localization={(i18n) => {
        i18n.addResourceBundle('en', 'translation', {
          'no-ratings-available': 'No ratings available',
        });
      }}
    >
      <AtomicSearchLayout>
        <AtomicLayoutSection section="search">
          <AtomicSearchBox>
            <AtomicSearchBoxQuerySuggestions />
            {options.recentQueries && <AtomicSearchBoxRecentQueries />}
            {options.instantResults && (
              <AtomicSearchBoxInstantResults
                template={InstantResultsTemplate}
                imageSize="small"
                ariaLabelGenerator={InstantResultsAriaLabelTemplate}
              />
            )}
          </AtomicSearchBox>
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
            {children}
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

function InstantResultsAriaLabelTemplate({i18n}: Bindings, result: Result) {
  const information = [result.title];

  if ('ec_rating' in result.raw) {
    information.push(
      i18n.t('stars', {
        count: result.raw.ec_rating as number,
        max: 5,
      })
    );
  } else {
    information.push(i18n.t('no-ratings-available'));
  }

  if ('ec_price' in result.raw) {
    information.push(
      (result.raw.ec_price as number).toLocaleString(
        i18n.languages as string[],
        {
          style: 'currency',
          currency: 'USD',
        }
      )
    );
  }

  return information.join(', ');
}

function InstantResultsTemplate() {
  return (
    <>
      <style>{'.result-root{padding: 14px;}'}</style>
      <AtomicResultSectionVisual>
        <AtomicResultImage field="ec_images" />
      </AtomicResultSectionVisual>
      <AtomicResultSectionTitle>
        <AtomicResultLink />
      </AtomicResultSectionTitle>
      <AtomicResultSectionTitleMetadata>
        <AtomicResultRating field="ec_rating" />
        <AtomicResultNumber field="ec_price">
          <AtomicFormatCurrency currency="USD" />
        </AtomicResultNumber>
      </AtomicResultSectionTitleMetadata>
    </>
  );
}
