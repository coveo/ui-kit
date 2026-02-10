/**
 * MRE (Minimal Reproduction Example) for Facet tabsIncluded Issue
 *
 * Issue: When two facets have the same label but different tabsIncluded values,
 * switching tabs does not correctly hide/show the appropriate facet.
 *
 * Customer Scenario (HP):
 * - AtomicCategoryFacet "Product Type" (field: kmtargetproductl1l5namelist) with tabsIncluded={["All", "Downloads", "Documents", "Videos"]}
 * - AtomicFacet "Product Type" (field: kmpmlevel1name) with tabsIncluded={["Products"]}
 *
 * Expected behavior:
 * - On "Products" tab: only facetId="kmpmlevel1name" should show
 * - On other tabs: only facetId="kmtargetproductl1l5namelist" should show
 *
 * Actual behavior (reported):
 * - When selecting a value in the Category facet on "All" tab, then switching to "Products" tab,
 *   the wrong facet (kmtargetproductl1l5namelist) still appears and causes no results.
 *
 * Customer Version: Atomic 3.42, Headless 3.37
 * Org: hewlettpackardnonproduction1u51hay96
 */
import {
  AtomicBreadbox,
  AtomicCategoryFacet,
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
  AtomicResultSectionTitle,
  AtomicSearchBox,
  AtomicSearchBoxQuerySuggestions,
  AtomicSearchInterface,
  AtomicSearchLayout,
  AtomicSortDropdown,
  AtomicSortExpression,
  AtomicTab,
  AtomicTabManager,
} from '@coveo/atomic-react';
import {buildSearchEngine} from '@coveo/headless';
import {type FunctionComponent, useMemo} from 'react';

export const FacetTabsMRE: FunctionComponent = () => {
  const engine = useMemo(
    () =>
      buildSearchEngine({
        configuration: {
          organizationId: 'hewlettpackardnonproduction1u51hay96',
          accessToken: 'xx6a8627d0-7d30-467e-84c3-e0dfe5dcd6c0',
          analytics: {
            analyticsMode: 'legacy',
          },
        },
      }),
    []
  );

  return (
    <AtomicSearchInterface engine={engine}>
      <AtomicSearchLayout>
        <AtomicLayoutSection section="search">
          <AtomicSearchBox>
            <AtomicSearchBoxQuerySuggestions />
          </AtomicSearchBox>
        </AtomicLayoutSection>

        <AtomicLayoutSection section="facets">
          <AtomicFacetManager>
            <AtomicCategoryFacet
              facetId="kmtargetproductl1l5namelist"
              field="kmtargetproductl1l5namelist"
              label="Product Type"
              numberOfValues={5}
              tabsIncluded={['All', 'Downloads', 'Documents', 'Videos']}
              withSearch={true}
              delimitingCharacter="|"
              sortCriteria="occurrences"
            />

            <AtomicFacet
              facetId="kmpmlevel1name"
              field="kmpmlevel1name"
              label="Product Type"
              numberOfValues={5}
              tabsIncluded={['Products']}
              sortCriteria="score"
            />
          </AtomicFacetManager>
        </AtomicLayoutSection>

        <AtomicLayoutSection section="main">
          <AtomicLayoutSection section="status">
            <AtomicTabManager>
              <AtomicTab name="All" label="All" />
              <AtomicTab name="Products" label="Products" />
              <AtomicTab name="Downloads" label="Downloads" />
              <AtomicTab name="Documents" label="Documents" />
              <AtomicTab name="Videos" label="Videos" />
            </AtomicTabManager>
          </AtomicLayoutSection>

          <AtomicLayoutSection section="status">
            <AtomicBreadbox />
            <AtomicQuerySummary />
            <AtomicRefineToggle />

            <AtomicSortDropdown>
              <AtomicSortExpression label="Relevance" expression="relevancy" />
              <AtomicSortExpression
                label="Date (newest first)"
                expression="hpescuniversaldate descending"
              />
            </AtomicSortDropdown>
          </AtomicLayoutSection>

          <AtomicLayoutSection section="results">
            <AtomicResultList
              template={() => ({
                contentTemplate: (
                  <AtomicResultSectionTitle>
                    <AtomicResultLink />
                  </AtomicResultSectionTitle>
                ),
                linkTemplate: <></>,
              })}
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
