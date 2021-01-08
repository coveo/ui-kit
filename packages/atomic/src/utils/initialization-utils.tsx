import {Engine} from '@coveo/headless';
import {ComponentInterface, getElement, h} from '@stencil/core';
import {i18n} from 'i18next';

export interface InterfaceContext {
  engine: Engine;
  i18n: i18n;
}

export type InitializeEventHandler = (context: InterfaceContext) => void;
export type InitializeEvent = CustomEvent<InitializeEventHandler>;

export class InitializationError extends Error {
  constructor(elementName: string) {
    super(
      `The "${elementName}" element must be the child of a configured "atomic-search-interface" element.`
    );
    this.name = 'InitializationError';
  }
}

export function Initialization() {
  return (component: ComponentInterface, initializeMethod: string) => {
    const {
      componentWillLoad,
      render,
      componentDidRender,
      componentDidLoad,
      [initializeMethod]: initialize,
    } = component;
    const errorProperty = 'error';
    const contextProperty = 'context';

    component.componentWillLoad = function () {
      const element = getElement(this);
      const event = new CustomEvent('atomic/initializeComponent', {
        detail: (context: InterfaceContext) => {
          this[contextProperty] = context;
          try {
            initialize.call(this);
          } catch (error) {
            this[errorProperty] = error;
          }
        },
        bubbles: true,
        cancelable: true,
      });
      const canceled = element.dispatchEvent(event);
      if (canceled) {
        this[errorProperty] = new InitializationError(
          element.nodeName.toLowerCase()
        );
        return;
      }

      return componentWillLoad && componentWillLoad.call(this);
    };

    let hasRendered = false;
    let hasLoaded = false;

    component.render = function () {
      if (this[errorProperty]) {
        hasRendered = true;
        return (
          <atomic-component-error
            error={this[errorProperty]}
          ></atomic-component-error>
        );
      }

      if (!this[contextProperty]) {
        return;
      }

      hasRendered = true;
      return render && render.call(this);
    };

    component.componentDidRender = function () {
      if (!hasRendered) {
        return;
      }

      componentDidRender && componentDidRender.call(this);
      if (!hasLoaded) {
        componentDidLoad && componentDidLoad.call(this);
        hasLoaded = true;
      }
      return;
    };

    component.componentDidLoad = function () {};
  };
}
