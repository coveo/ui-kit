import type {CoreEngine} from '@coveo/headless';
import type {AnyBindings} from '../components/common/interface/bindings';
// oxlint-disable-next-line @typescript-eslint/ban-ts-comment -- Import from a generated file that might be missing before build.
//@ts-ignore - Import from a generated file, _might_ be missing if the build hasn't been run yet, but this file is only used at runtime, so it should be fine.
import {ATOMIC_CUSTOM_ELEMENT_TAGS} from './custom-element-tags.js';
import {buildCustomEvent} from './event-utils';
import {enqueueOrDispatchInitializationEvent} from './init-queue';

/**
 * Retrieves `Bindings` or `CommerceBindings` on a configured parent interface.
 * @param event - The element on which to dispatch the event, which must be the child of a configured Atomic container element.
 * @returns A promise that resolves upon initialization of the parent container element, and rejects otherwise.
 */
export function fetchBindings<SpecificBindings extends AnyBindings>(element: Element) {
  return new Promise<SpecificBindings>((resolve, reject) => {
    const event = buildCustomEvent<InitializeEventHandler>(
      initializeEventName,
      (bindings: unknown) => resolve(bindings as SpecificBindings)
    );
    const parent = findInterfaceParent(element);
    if (!parent) {
      reject(new MissingInterfaceParentError(element.nodeName.toLowerCase()));
      return;
    }
    enqueueOrDispatchInitializationEvent(parent, event, element);
  });
}
/**
 * Finds the closest Atomic interface element, starting with the element itself and walking up the composed tree.
 * A slotted node's parent is its assigned slot, and a shadow root's parent is its host.
 *
 * @param element The element to start from.
 * @returns The interface element, or `null` when there is none.
 */
export function findInterfaceParent(element: Element): Element | null {
  const selector = initializableElements.join(', ');
  let node: Node | null = element;
  while (node) {
    if (node instanceof Element && node.matches(selector)) {
      return node;
    }
    node = getComposedParent(node);
  }
  return null;
}

function getComposedParent(node: Node): Node | null {
  if (node instanceof Element && node.assignedSlot) {
    return node.assignedSlot;
  }
  if (node instanceof ShadowRoot) {
    return node.host;
  }
  return node.parentNode;
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
const initializableElements = [
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
export async function waitForAtomicChildrenToBeDefined(host: Element): Promise<void> {
  await Promise.all(
    Array.from(host.querySelectorAll('*'))
      .filter((el) => ATOMIC_CUSTOM_ELEMENT_TAGS.has(el.tagName.toLowerCase()))
      .map((el) => customElements.whenDefined(el.tagName.toLowerCase()))
  );
}
