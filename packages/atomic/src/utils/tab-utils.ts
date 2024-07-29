/**
 * Determines whether the component should be displayed on the current tab.
 *
 * @param tabsIncluded - An array of tab names that should include the facet.
 * @param tabsExcluded - An array of tab names that should exclude the facet.
 * @param activeTab - The name of the currently active tab.
 * @returns A boolean indicating whether the component should be displayed on the current tab.
 */
export function shouldDisplayOnCurrentTab(
  includeTabs: string[],
  excludeTabs: string[],
  activeTab: string
) {
  if (!activeTab) {
    return true;
  }

  const isIncluded =
    includeTabs.length === 0 || includeTabs.includes(activeTab);
  const isNotExcluded =
    excludeTabs.length === 0 || !excludeTabs.includes(activeTab);

  return isIncluded && isNotExcluded;
}
