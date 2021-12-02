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

type ResultContextEventHandler = (result: Result) => void;
export type ResultContextEvent = CustomEvent<ResultContextEventHandler>;
const resultContextEventName = 'atomic/resolveResult';

/**
 * Retrieves `Result` on a rendered `atomic-result`.
 *
 * This method is useful to build custom result template elements, see [Create a Result List](https://docs.coveo.com/en/atomic/latest/usage/create-a-result-list/) for more information.
 *
 * @param element Element on which to dispatch the event, which must be the child of a rendered "atomic-result".
 * @returns A promise that resolves on initialization of the parent "atomic-result" element, and rejects when it's not the case.
 */
export const resultContext = (element: Element) =>
  new Promise<Result>((resolve, reject) => {
    const event = buildCustomEvent<ResultContextEventHandler>(
      resultContextEventName,
      (result: Result) => resolve(result)
    );
    element.dispatchEvent(event);

    if (!element.closest('atomic-result')) {
      reject(new MissingResultParentError(element.nodeName.toLowerCase()));
    }
  });
