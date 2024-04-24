import {CategoryFacet, DateFacet, Facet, NumericFacet} from '@coveo/headless';
import {TabSetState} from '@coveo/headless/dist/definitions/features/tab-set/tab-set-state';
import {shouldDisplayOnCurrentTab} from '../../../../utils/tab-utils';

type AnyFacetType = Facet | NumericFacet | CategoryFacet | DateFacet;

/**
 * Updates the visibility of a facet based on the active tab.
 * @param tabsIncluded - An array of tab names that should include the facet.
 * @param tabsExcluded - An array of tab names that should exclude the facet.
 * @param tabSetState - The state object containing the set of tabs.
 * @param facet - The facet to update.
 */
export function updateFacetVisibilityForActiveTab(
  tabsIncluded: string[] | string,
  tabsExcluded: string[] | string,
  tabSetState: Partial<TabSetState> | undefined,
  facet?: AnyFacetType
): void {
  if (
    !facet ||
    (tabsIncluded.length === 0 && tabsExcluded.length === 0) ||
    !tabSetState
  ) {
    return;
  }
  const shouldDisplay = shouldDisplayOnCurrentTab(
    tabsIncluded,
    tabsExcluded,
    tabSetState
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
