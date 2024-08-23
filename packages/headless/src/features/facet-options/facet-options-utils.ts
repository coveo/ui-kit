export const isFacetIncludedOnTab = (
  facetTabs: {excluded?: string[]; included?: string[]} | undefined,
  activeTab: string | undefined
) => {
  if (!facetTabs || !activeTab) {
    return true;
  }

  if (facetTabs.excluded && facetTabs.excluded.includes(activeTab)) {
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
