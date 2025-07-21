export function getQ<Section, Value>(
  section: Section | undefined,
  querySelector: (state: Section) => Value,
  initialState: Value
) {
  if (section === undefined) {
    return {};
  }

  const q = querySelector(section);
  const shouldInclude = q !== initialState;
  return shouldInclude ? {q} : {};
}

export function getSortCriteria<Section, Value>(
  section: Section | undefined,
  sortCriteriaSelector: (state: Section) => Value,
  initialState: Value
) {
  if (section === undefined) {
    return {};
  }

  const sortCriteria = sortCriteriaSelector(section);
  const shouldInclude = sortCriteria !== initialState;
  return shouldInclude ? {sortCriteria} : {};
}

export function getFacets<Value, Request, Parameters>(
  section: Record<string, {request: Request}> | undefined,
  facetIsEnabled: (facetId: string) => boolean,
  valuesSelector: (request: Request) => Value[],
  out: keyof Parameters
) {
  if (section === undefined) {
    return {};
  }

  const facets = Object.entries(section!)
    .filter(([facetId]) => facetIsEnabled(facetId))
    .map(([facetId, {request}]) => {
      const selectedValues = valuesSelector(request);
      return selectedValues.length ? {[facetId]: selectedValues} : {};
    })
    // biome-ignore lint/performance/noAccumulatingSpread: <>
    .reduce((acc, obj) => ({...acc, ...obj}), {});

  return Object.keys(facets).length ? {[out]: facets} : {};
}

export function getTab<Section>(
  section: Section | undefined,
  tabSelector: (tabSet: Section) => string,
  initialState: string
) {
  if (section === undefined) {
    return {};
  }

  const tab = tabSelector(section);
  const shouldInclude = tab !== initialState;
  return shouldInclude ? {tab} : {};
}
