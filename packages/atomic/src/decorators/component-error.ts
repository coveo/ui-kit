import {html} from 'lit';
import '@/src/components/common/atomic-component-error/atomic-component-error';

const loggedErrors = new WeakSet<Error>();

/**
 * Logs a component error to the console, once per error, with the element it belongs to.
 * Called where the error is noticed rather than where it is displayed, so that an error
 * is reported even when nothing renders it.
 */
export function logComponentError(error: Error, element: Element) {
  if (loggedErrors.has(error)) {
    return;
  }
  loggedErrors.add(error);
  console.error(error, element);
}

export function renderComponentError(host: HTMLElement, error: Error) {
  return html`<atomic-component-error .error=${error} .element=${host}></atomic-component-error>`;
}
