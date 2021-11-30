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

/**
 * A [StencilJS property decorator](https://stenciljs.com/) to be used for result template components.
 * This allows the Stencil component to fetch the current result from its rendered parent, the `atomic-result` component.
 *
 *
 * @example
 * @ResultContext() private result!: Result;
 *
 * For more information and examples, view the "Utilities" section of the readme.
 */
export function ResultContext() {
  return (component: ComponentInterface, resultVariable: string) => {
    const {connectedCallback, render} = component;
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

    component.render = function () {
      if (this.error) {
        const element = getElement(this);
        element.remove();
        console.error(
          'Result component is in error and has been removed from the DOM',
          this.error,
          this,
          element
        );
        return;
      }
      return render && render.call(this);
    };
  };
}
