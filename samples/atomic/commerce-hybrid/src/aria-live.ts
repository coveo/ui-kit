/**
 * Announces cart changes through the `atomic-aria-live` element that every Atomic
 * interface injects into itself on connect.
 *
 * Atomic's own components reach this element through an internal Lit controller,
 * which is not exported. The underlying mechanism is a DOM event, though, so any
 * element can use it: dispatch `atomic/accessibility/findAriaLive` on `document`
 * and the live-region element writes itself into `event.detail.element`.
 *
 * Reusing Atomic's region rather than adding a second one keeps cart messages in
 * the same queue as Atomic's own announcements (query summary, facets, pager), so
 * screen readers do not read them out of order.
 */
function findAriaLive() {
  const event = new CustomEvent<{element: HTMLElementTagNameMap['atomic-aria-live'] | null}>(
    'atomic/accessibility/findAriaLive',
    {detail: {element: null}}
  );
  document.dispatchEvent(event);
  return event.detail.element;
}

const region = 'cart';

export function announce(message: string) {
  const ariaLive = findAriaLive();
  if (!ariaLive) {
    return;
  }
  ariaLive.registerRegion(region, false);
  ariaLive.updateMessage(region, message, false);
}
