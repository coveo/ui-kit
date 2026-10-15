/** Spread on the element that takes focus when a gesture removes the control that had it. */
export const resultsFocusTarget = {'data-results-focus-target': true, tabIndex: -1} as const;

/**
 * Searches outward from `from` so the closest results win: earlier turns keep their own result
 * lists on the page, and focusing one of those would send the shopper back in the conversation.
 */
export function focusNearestResults(from: Element | null): void {
  for (let node = from; node; node = node.parentElement) {
    const target = node.querySelector<HTMLElement>('[data-results-focus-target]');
    if (target) {
      target.focus();
      return;
    }
  }
}
