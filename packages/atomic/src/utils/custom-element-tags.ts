/**
 * Set of all custom element tags defined in the Atomic library.
 * This is generated at build time from @customElement decorators (Lit components only).
 * Stencil components are excluded as they lazy-load.
 */
import elementMap from '@/src/components/lazy-index.js';

const ATOMIC_CUSTOM_ELEMENT_TAGS = new Set<string>(Object.keys(elementMap));

/**
 * Waits for all Atomic custom element children to be defined.
 * This ensures that all vanilla (non-framework) Atomic components have been
 * registered with the custom elements registry before proceeding.
 *
 * @param host - The host element to scan for Atomic children
 */
export async function waitForAtomicChildrenToBeDefined(
  host: Element
): Promise<void> {
  await Promise.all(
    Array.from(host.querySelectorAll('*'))
      .filter((el) => ATOMIC_CUSTOM_ELEMENT_TAGS.has(el.tagName.toLowerCase()))
      .map((el) => customElements.whenDefined(el.tagName.toLowerCase()))
  );
}
