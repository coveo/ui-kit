import type {AnyBindings} from '../components/common/interface/bindings';
import type {Bindings} from '../components/search/atomic-search-interface/interfaces';
import {closest} from './dom-utils.js';
import {buildCustomEvent} from './event-utils.js';
import {
  initializeEventName,
  initializableElements,
  InitializeEventHandler,
  MissingInterfaceParentError,
} from './initialization-lit-stencil-common-utils.js';

export {
  initializableElements,
  InitializeEventHandler,
  MissingInterfaceParentError,
} from './initialization-lit-stencil-common-utils.js';

/**
 * Retrieves `Bindings` or `CommerceBindings` on a configured parent interface.
 * @param event - The element on which to dispatch the event, which must be the child of a configured Atomic container element.
 * @returns A promise that resolves upon initialization of the parent container element, and rejects otherwise.
 */
export function initializeBindings<
  SpecificBindings extends AnyBindings = Bindings,
>(element: Element) {
  return new Promise<SpecificBindings>((resolve, reject) => {
    const event = buildCustomEvent<InitializeEventHandler>(
      initializeEventName,
      (bindings: unknown) => resolve(bindings as SpecificBindings)
    );
    element.dispatchEvent(event);

    if (!closest(element, initializableElements.join(', '))) {
      reject(new MissingInterfaceParentError(element.nodeName.toLowerCase()));
    }
  });
}
