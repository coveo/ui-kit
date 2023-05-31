export const ariaLiveComponent = 'atomic-aria-live';

export const AriaLiveSelectors = {
  region: (region: string) =>
    cy
      .get('atomic-search-interface')
      .find(ariaLiveComponent)
      .find(`[aria-live][id$="-${region}"]`),
};
