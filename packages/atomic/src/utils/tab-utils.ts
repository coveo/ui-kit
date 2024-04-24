import {TabSetState} from '@coveo/headless/dist/definitions/features/tab-set/tab-set-state';

/**
 * Retrieves the active tab from the given tab set state.
 * @param tabSetState - The state object containing the set of tabs..
 * @returns An object containing the active tab ID, or null if no active tab is found.
 */
export function getActiveTab(tabSetState: Partial<TabSetState>): string | null {
  const activeTab = Object.values(tabSetState ?? {}).find(
    (tab) => tab?.isActive
  );
  return activeTab ? activeTab.id : null;
}

/**
 * Determines whether the component should be displayed on the current tab.
 *
 * @param tabsIncluded - An array of tab names that should include the facet.
 * @param tabsExcluded - An array of tab names that should exclude the facet.
 * @param tabSetState - The state object containing the set of tabs.
 * @returns A boolean indicating whether the component should be displayed on the current tab.
 */
export function shouldDisplayOnCurrentTab(
  includeTabs: string[] | string,
  excludeTabs: string[] | string,
  tabSetState: Partial<TabSetState>
) {
  const activeTab = getActiveTab(tabSetState);
  if (!activeTab) {
    return true;
  }

  const isIncluded =
    includeTabs.length === 0 || includeTabs.includes(activeTab);
  const isNotExcluded =
    excludeTabs.length === 0 || !excludeTabs.includes(activeTab);

  return isIncluded && isNotExcluded;
}
