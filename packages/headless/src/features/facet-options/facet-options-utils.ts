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

  return false;
};
