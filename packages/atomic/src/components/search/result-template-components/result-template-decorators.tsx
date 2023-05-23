import {FoldedResult, InteractiveResult, Result} from '@coveo/headless';
import {ComponentInterface, getElement} from '@stencil/core';
import {buildCustomEvent} from '../../../utils/event-utils';
import {closest} from '../../../utils/utils';
import {AnyResult} from '../../common/interface/result';
import {
  ResultDisplayDensity,
  ResultDisplayImageSize,
} from '../../common/layout/display-options';
import {ResultTemplateProvider} from '../../common/result-list/result-template-provider';

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
 * Example:
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

export function InteractiveResultContext() {
  return (component: ComponentInterface, interactiveResultVariable: string) => {
    const {connectedCallback} = component;
    component.connectedCallback = function () {
      const element = getElement(this);
      const event = buildCustomEvent(
        interactiveResultContextEventName,
        (result: AnyResult) => {
          this[interactiveResultVariable] = result;
        }
      );
      element.dispatchEvent(event);
      return connectedCallback && connectedCallback.call(this);
    };
  };
}

type ResultContextEventHandler<T = Result> = (result: T) => void;
export type ResultContextEvent<T = Result> = CustomEvent<
  ResultContextEventHandler<T>
>;
const resultContextEventName = 'atomic/resolveResult';
export type InteractiveResultContextEvent = CustomEvent<
  (interactiveResult: InteractiveResult) => void
>;
const interactiveResultContextEventName = 'atomic/resolveInteractiveResult';

/**
 * Retrieves `Result` on a rendered `atomic-result`.
 *
 * This method is useful for building custom result template elements, see [Create a Result List](https://docs.coveo.com/en/atomic/latest/cc-search/create-custom-components/native-components/#custom-result-template-component-example) for more information.
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
  resultTemplateProvider?: ResultTemplateProvider
) => void;
export type ChildTemplatesContextEvent =
  CustomEvent<ChildTemplatesContextEventHandler>;
const childTemplatesContextEventName = 'atomic/resolveChildTemplates';

interface AtomicResultChildren {
  resultTemplateProvider?: ResultTemplateProvider;
}
/**
 * A [StencilJS property decorator](https://stenciljs.com/) to be used for children result templates.
 * This allows the Stencil component to fetch children templates defined a level above.
 */
export function ChildTemplatesContext() {
  return (
    component: ComponentInterface,
    resultTemplateProviderProp: string
  ) => {
    const {componentWillRender} = component;
    component.componentWillRender = function () {
      const element = getElement(this);
      const event = buildCustomEvent(
        childTemplatesContextEventName,
        (resultTemplateProvider?: ResultTemplateProvider) => {
          const component = this as AtomicResultChildren;
          if (component.resultTemplateProvider) {
            return;
          }

          this[resultTemplateProviderProp] = resultTemplateProvider;
        }
      );

      const canceled = element.dispatchEvent(event);
      if (canceled) {
        this[resultTemplateProviderProp] = null;
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
