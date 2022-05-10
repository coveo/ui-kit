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
  AtomicSearchBox,
  AtomicSearchInterface,
  AtomicSearchLayout,
  AtomicSortDropdown,
  AtomicSortExpression,
  AtomicTimeframe,
  AtomicTimeframeFacet,
  buildSearchEngine,
} from '@coveo/atomic-react';

type Props = {
  accessToken: string;
  organizationId: string;
  children: React.ReactNode;
};

export const AtomicApp: FunctionComponent<Props> = ({
  accessToken,
  organizationId,
  children,
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
