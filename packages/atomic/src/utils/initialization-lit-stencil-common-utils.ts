import type {AnyBindings} from '../components/common/interface/bindings';
import {closest} from './dom-utils';
import {buildCustomEvent} from './event-utils';

export function fetchBindings<SpecificBindings extends AnyBindings>(
  element: Element
) {
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
