/**
 * Bridge to the `atomic-aria-live` element that `atomic-commerce-interface`
 * injects into itself on connect.
 *
 * Atomic's own components reach this element through an internal Lit
 * `ReactiveController`, which is not exported. The underlying mechanism is a
 * DOM event, though, so any element can use it: dispatch
 * `atomic/accessibility/findAriaLive` on `document` and the live-region element
 * writes itself into `event.detail.element`.
 *
 * This matters because replacing `atomic-commerce-search-box` takes three
 * screen-reader announcements with it: suggestion counts, the active suggestion
 * label, and "search box cleared". Reusing Atomic's region keeps those
 * announcements in the same live region as the rest of the interface, so they
 * are not announced out of order against `atomic-commerce-query-summary`.
 */
export function findAriaLive() {
  const event = new CustomEvent('atomic/accessibility/findAriaLive', {
    detail: {element: null},
    bubbles: false,
  });
  document.dispatchEvent(event);
  return event.detail.element;
}

/**
 * Registers the live regions a search box owns, and returns an `announce`
 * function for them. Falls back to a no-op when no `atomic-aria-live` element is
 * present, so a custom box can also be used outside an Atomic interface.
 */
export function createAnnouncer(regions) {
  const ariaLive = findAriaLive();

  if (!ariaLive) {
    return () => {};
  }

  for (const [region, assertive] of Object.entries(regions)) {
    ariaLive.registerRegion(region, assertive);
  }

  return (region, message) => {
    ariaLive.updateMessage(region, message, regions[region] ?? false);
  };
}
