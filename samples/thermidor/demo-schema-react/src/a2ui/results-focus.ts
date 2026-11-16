/** Spread on the element that takes focus when a gesture removes the control that had it. */
export const resultsFocusTarget = {'data-results-focus-target': true, tabIndex: -1} as const;

/** Spread on the product grid that a page change scrolls back to. */
export const productListTarget = {'data-product-list': true} as const;

/**
 * Searches outward from `from` so the closest match wins: earlier turns keep their own result
 * lists on the page, and reaching one of those would send the shopper back in the conversation.
 */
function findNearest(from: Element | null, selector: string): HTMLElement | null {
  for (let node = from; node; node = node.parentElement) {
    const target = node.querySelector<HTMLElement>(selector);
    if (target) {
      return target;
    }
  }
  return null;
}

/** Focuses the results closest to `from`. */
export function focusNearestResults(from: Element | null): void {
  findNearest(from, '[data-results-focus-target]')?.focus();
}

/**
 * Scrolls the product list closest to `from` into view and focuses its first product, as the
 * Atomic pager does once a new page lands.
 */
export function scrollToFirstProduct(from: Element | null): void {
  const list = findNearest(from, '[data-product-list]');
  if (!list) {
    return;
  }
  list.scrollIntoView({block: 'start'});
  list.querySelector<HTMLElement>('[role="listitem"]')?.focus({preventScroll: true});
}
