'use client';

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
  AtomicQueryError,
  AtomicQuerySummary,
  AtomicRatingFacet,
  AtomicRatingRangeFacet,
  AtomicRefineToggle,
  AtomicResultDate,
  AtomicResultFieldsList,
  AtomicResultLink,
  AtomicResultList,
  AtomicResultMultiValueText,
  AtomicResultSectionBottomMetadata,
  AtomicResultSectionTitle,
  AtomicResultText,
  AtomicSearchBox,
  AtomicSearchInterface,
  AtomicSearchLayout,
  AtomicSortDropdown,
  AtomicSortExpression,
  AtomicText,
  AtomicTimeframe,
  AtomicTimeframeFacet,
} from '@coveo/atomic-react';
import {buildSearchEngine, type Result} from '@coveo/headless';
import type {NextPage} from 'next';
import {useMemo} from 'react';

const SearchPage: NextPage = () => {
  const engine = useMemo(
    () =>
      buildSearchEngine({
        configuration: {
          accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
          organizationId: 'searchuisamples',
        },
      }),
    []
  );

  return (
    <AtomicSearchInterface engine={engine}>
      <AtomicSearchLayout>
        <AtomicLayoutSection section="search">
          <AtomicSearchBox />
        </AtomicLayoutSection>
        <AtomicLayoutSection section="facets">
          <AtomicFacetManager>
            <AtomicFacet field="source" label="Source" />
            <AtomicFacet field="objecttype" label="Type" />
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
            <AtomicQuerySummary />
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
            <AtomicResultList
              display="list"
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

function MyTemplate(result: Result) {
  return (
    <>
      <AtomicResultSectionTitle>
        <AtomicResultLink />
      </AtomicResultSectionTitle>
      <AtomicResultSectionBottomMetadata>
        <AtomicResultFieldsList>
          <AtomicResultDate format="ddd MMM D YYYY" />
          {/** biome-ignore lint/complexity/noUselessFragments: <> */}
          <>
            {result.raw.cat_platform && (
              <>
                <span className="field-label">
                  <AtomicText value="Platform" />
                </span>
                <AtomicResultText field="cat_platform" />
              </>
            )}
            {result.raw.cat_condition && (
              <>
                <span className="field-label">
                  <AtomicText value="Condition" />
                </span>
                <AtomicResultText field="cat_condition" />
              </>
            )}
            {result.raw.cat_categories && (
              <>
                <span className="field-label">
                  <AtomicText value="Tags" />
                </span>
                <AtomicResultMultiValueText field="cat_categories" />
              </>
            )}
          </>
        </AtomicResultFieldsList>
      </AtomicResultSectionBottomMetadata>
    </>
  );
}

export default SearchPage;
