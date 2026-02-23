export const isFacetVisibleOnTab = (
  facetTabs: {excluded?: string[]; included?: string[]} | undefined,
  activeTab: string | undefined
) => {
  if (
    (typeof facetTabs === 'object' &&
      Object.keys({...facetTabs}).length === 0) ||
    !activeTab ||
    !facetTabs
  ) {
    return true;
  }

  if (facetTabs.excluded?.includes(activeTab)) {
    return false;
  }

  if (
    facetTabs.included &&
    (facetTabs.included.length === 0 || facetTabs.included.includes(activeTab))
  ) {
    return true;
  }

  // If only excluded is defined and the tab is not in the excluded list, the facet is visible
  if (facetTabs.excluded && !facetTabs.included) {
    return true;
  }

  return false;
};
