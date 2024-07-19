import {CategoryFacet, DateFacet, Facet, NumericFacet} from '@coveo/headless';
import {shouldDisplayOnCurrentTab} from '../../../../utils/tab-utils';

type AnyFacetType = Facet | NumericFacet | CategoryFacet | DateFacet;

/**
 * Updates the visibility of a facet based on the active tab.
 * @param tabsIncluded - An array of tab names that should include the facet.
 * @param tabsExcluded - An array of tab names that should exclude the facet.
 * @param activeTab - The currently active tab.
 * @param facet - The facet to update.
 */
export function updateFacetVisibilityForActiveTab(
  tabsIncluded: string[] | string,
  tabsExcluded: string[] | string,
  activeTab: string,
  facet?: AnyFacetType
): void {
  if (
    !facet ||
    (tabsIncluded.length === 0 && tabsExcluded.length === 0) ||
    !activeTab
  ) {
    return;
  }
  const shouldDisplay = shouldDisplayOnCurrentTab(
    tabsIncluded,
    tabsExcluded,
    activeTab
  );

  if (shouldDisplay && !facet.state.enabled) {
    facet.enable();
    return;
  }

  if (!shouldDisplay && facet.state.enabled) {
    facet.disable();
    return;
  }
}
