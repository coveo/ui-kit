import {Result} from '@coveo/headless';
import {ComponentInterface, getElement} from '@stencil/core';
import {buildCustomEvent} from '../../utils/event-utils';

export class MissingResultParentError extends Error {
  constructor(elementName: string) {
    super(
      `The "${elementName}" element must be the child of an "atomic-result" element.`
    );
  }
}

export function ResultContext() {
  return (component: ComponentInterface, resultVariable: string) => {
    const {connectedCallback} = component;
    component.connectedCallback = function () {
      const element = getElement(this);
      const event = buildCustomEvent(
        'atomic/resolveResult',
        (result: Result) => {
          this[resultVariable] = result;
        }
      );

      const canceled = element.dispatchEvent(event);
      if (canceled) {
        this.error = new MissingResultParentError(
          element.nodeName.toLowerCase()
        );
        return;
      }
      return connectedCallback && connectedCallback.call(this);
    };
  };
}
