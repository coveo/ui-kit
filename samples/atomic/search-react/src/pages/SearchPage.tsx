import {
  AtomicBreadbox,
  AtomicDidYouMean,
  AtomicFacet,
  AtomicFacetManager,
  AtomicLayoutSection,
  AtomicLoadMoreResults,
  AtomicNoResults,
  AtomicQueryError,
  AtomicQuerySummary,
  AtomicRefineToggle,
  AtomicResultLink,
  AtomicResultList,
  AtomicResultSectionExcerpt,
  AtomicResultSectionTitle,
  AtomicResultText,
  AtomicSearchBox,
  AtomicSearchBoxQuerySuggestions,
  AtomicSearchBoxRecentQueries,
  AtomicSearchInterface,
  AtomicSearchLayout,
  AtomicSortDropdown,
  AtomicSortExpression,
} from '@coveo/atomic-react';
import {
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
} from '@coveo/headless';
import {useMemo} from 'react';
import '../App.css';

export const SearchPage = () => {
  const engine = useMemo(
    () =>
      buildSearchEngine({
        configuration: getSampleSearchEngineConfiguration(),
      }),
    []
  );

  return (
    <AtomicSearchInterface engine={engine}>
      <AtomicSearchLayout>
        <AtomicLayoutSection section="search">
          <AtomicSearchBox>
            <AtomicSearchBoxQuerySuggestions />
            <AtomicSearchBoxRecentQueries />
          </AtomicSearchBox>
        </AtomicLayoutSection>
        <AtomicLayoutSection section="facets">
          <AtomicFacetManager>
            <AtomicFacet field="source" label="Source" />
            <AtomicFacet field="objecttype" label="Type" />
            <AtomicFacet field="author" label="Author" />
          </AtomicFacetManager>
        </AtomicLayoutSection>
        <AtomicLayoutSection section="main">
          <AtomicLayoutSection section="status">
            <AtomicBreadbox />
            <AtomicQuerySummary />
            <AtomicRefineToggle />
            <AtomicSortDropdown>
              <AtomicSortExpression label="Relevance" expression="relevancy" />
              <AtomicSortExpression
                label="Date (newest)"
                expression="date descending"
              />
              <AtomicSortExpression
                label="Date (oldest)"
                expression="date ascending"
              />
            </AtomicSortDropdown>
            <AtomicDidYouMean />
          </AtomicLayoutSection>
          <AtomicLayoutSection section="results">
            <AtomicResultList template={ResultTemplate} />
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

function ResultTemplate() {
  return (
    <>
      <AtomicResultSectionTitle>
        <AtomicResultLink />
      </AtomicResultSectionTitle>
      <AtomicResultSectionExcerpt>
        <AtomicResultText field="excerpt" />
      </AtomicResultSectionExcerpt>
    </>
  );
}
