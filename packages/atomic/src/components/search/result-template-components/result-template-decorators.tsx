import {FoldedResult, Result, ResultTemplatesManager} from '@coveo/headless';
import {ComponentInterface, getElement} from '@stencil/core';
import {buildCustomEvent} from '../../../utils/event-utils';
import {closest} from '../../../utils/utils';
import {
  ResultDisplayDensity,
  ResultDisplayImageSize,
} from '../atomic-result/atomic-result-display-options';
import {TemplateContent} from '../result-templates/result-template-common';

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
export function ResultContext(opts: {folded: boolean} = {folded: false}) {
  return (component: ComponentInterface, resultVariable: string) => {
    const {connectedCallback, componentWillRender, render} = component;
    component.connectedCallback = function () {
      const element = getElement(this);
      const event = buildCustomEvent(
        resultContextEventName,
        (result: FoldedResult | Result) => {
          if (opts.folded) {
            if (isFolded(result)) {
              this[resultVariable] = result;
            } else {
              this[resultVariable] = {children: [], result};
            }
          } else {
            this[resultVariable] = isFolded(result) ? result.result : result;
          }
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

    component.componentWillRender = function () {
      if (this.error) {
        return;
      }

      return componentWillRender && componentWillRender.call(this);
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

type ResultContextEventHandler<T = Result> = (result: T) => void;
export type ResultContextEvent<T = Result> = CustomEvent<
  ResultContextEventHandler<T>
>;
const resultContextEventName = 'atomic/resolveResult';

/**
 * Retrieves `Result` on a rendered `atomic-result`.
 *
 * This method is useful for building custom result template elements, see [Create a Result List](https://docs.coveo.com/en/atomic/latest/usage/create-a-result-list/) for more information.
 *
 * You should use the method in the [connectedCallback lifecycle method](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#using_the_lifecycle_callbacks).
 *
 * @param element The element that the event is dispatched to, which must be the child of a rendered "atomic-result".
 * @returns A promise that resolves on initialization of the parent "atomic-result" element, or rejects when there is no parent "atomic-result" element.
 */
export function resultContext<T extends Result | FoldedResult = Result>(
  element: Element
) {
  return new Promise<T>((resolve, reject) => {
    const event = buildCustomEvent<ResultContextEventHandler<T>>(
      resultContextEventName,
      (result: T) => {
        return resolve(result);
      }
    );
    element.dispatchEvent(event);

    if (!closest(element, 'atomic-result')) {
      reject(new MissingResultParentError(element.nodeName.toLowerCase()));
    }
  });
}
function isFolded(result: Result | FoldedResult): result is FoldedResult {
  return 'children' in result;
}

type ChildTemplatesContextEventHandler = (
  result: ResultTemplatesManager<TemplateContent> | undefined
) => void;
export type ChildTemplatesContextEvent =
  CustomEvent<ChildTemplatesContextEventHandler>;
const childTemplatesContextEventName = 'atomic/resolveChildTemplates';

interface AtomicResultChildren {
  resultListCommon?: {
    resultTemplatesManager?: ResultTemplatesManager<TemplateContent>;
  };
}
/**
 * A [StencilJS property decorator](https://stenciljs.com/) to be used for children result templates.
 * This allows the Stencil component to fetch children templates defined a level above.
 */
export function ChildTemplatesContext() {
  return (component: ComponentInterface, resultVariable: string) => {
    const {componentWillRender} = component;
    component.componentWillRender = function () {
      const element = getElement(this);
      const event = buildCustomEvent(
        childTemplatesContextEventName,
        (result: ResultTemplatesManager<TemplateContent> | undefined) => {
          const resultListManager = (this as AtomicResultChildren)
            .resultListCommon?.resultTemplatesManager;
          this[resultVariable] = resultListManager !== result ? result : null;
        }
      );

      const canceled = element.dispatchEvent(event);
      if (canceled) {
        this[resultVariable] = null;
        return;
      }
      return componentWillRender && componentWillRender.call(this);
    };
  };
}

export type DisplayConfig = {
  density: ResultDisplayDensity;
  imageSize: ResultDisplayImageSize;
};

type ResultDisplayConfigContextEventHandler = (config: DisplayConfig) => void;
export type ResultDisplayConfigContextEvent =
  CustomEvent<ResultDisplayConfigContextEventHandler>;
const resultDisplayConfigContextEventName = 'atomic/resolveResultDisplayConfig';

/**
 * A [StencilJS property decorator](https://stenciljs.com/) to fetch display properties for a result.
 */
export function ResultDisplayConfigContext() {
  return (component: ComponentInterface, resultVariable: string) => {
    const {componentWillRender} = component;
    component.componentWillRender = function () {
      const element = getElement(this);
      const event = buildCustomEvent(
        resultDisplayConfigContextEventName,
        (config: DisplayConfig) => {
          this[resultVariable] = config;
        }
      );

      const canceled = element.dispatchEvent(event);
      if (canceled) {
        return;
      }
      return componentWillRender && componentWillRender.call(this);
    };
  };
}
