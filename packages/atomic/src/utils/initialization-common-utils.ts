import type {CoreEngine} from '@coveo/headless';
import type {AnyBindings} from '../components/common/interface/bindings';
//@ts-ignore - Import from a generated file, _might_ be missing if the build hasn't been run yet, but this file is only used at runtime, so it should be fine.
import {ATOMIC_CUSTOM_ELEMENT_TAGS} from './custom-element-tags.js';
import {closest} from './dom-utils';
import {buildCustomEvent} from './event-utils';
import {enqueueOrDispatchInitializationEvent} from './init-queue';

/**
 * Retrieves `Bindings` or `CommerceBindings` on a configured parent interface.
 * @param event - The element on which to dispatch the event, which must be the child of a configured Atomic container element.
 * @returns A promise that resolves upon initialization of the parent container element, and rejects otherwise.
 */
export function fetchBindings<SpecificBindings extends AnyBindings>(
  element: Element
) {
  return new Promise<SpecificBindings>((resolve, reject) => {
    const event = buildCustomEvent<InitializeEventHandler>(
      initializeEventName,
      (bindings: unknown) => resolve(bindings as SpecificBindings)
    );
    const parent = closest(element, initializableElements.join(', '));
    if (!parent) {
      reject(new MissingInterfaceParentError(element.nodeName.toLowerCase()));
      return;
    }
    enqueueOrDispatchInitializationEvent(parent, event, element);
  });
}
export type InitializeEventHandler = (bindings: AnyBindings) => void;
export class MissingInterfaceParentError extends Error {
  constructor(elementName: string) {
    super(
      `The "${elementName}" element must be the child of the following elements: ${initializableElements.join(
        ', '
      )}`
    );
  }
}
export const initializableElements = [
  'atomic-recs-interface',
  'atomic-search-interface',
  'atomic-commerce-interface',
  'atomic-commerce-recommendation-interface',
  'atomic-relevance-inspector',
  'atomic-insight-interface',
  'atomic-external',
];
export const initializeEventName = 'atomic/initializeComponent';

export type AtomicInterface = HTMLElement & {
  engine?: CoreEngine;
  bindings?: AnyBindings;
};

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
