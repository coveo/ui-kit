export const ariaLiveComponent = 'atomic-aria-live';

export const AriaLiveSelectors = {
  region: (region: string) =>
    cy
      .get('atomic-search-interface')
      .shadow()
      .find(ariaLiveComponent)
      .find(`#atomic-aria-region-${region}`),
};
