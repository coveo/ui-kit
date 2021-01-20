import {Engine} from '@coveo/headless';
import {ComponentInterface, getElement, h} from '@stencil/core';
import {i18n} from 'i18next';

export interface Bindings {
  engine: Engine;
  i18n: i18n;
}

export type InitializeEventHandler = (bindings: Bindings) => void;
export type InitializeEvent = CustomEvent<InitializeEventHandler>;

export class InitializationError extends Error {
  constructor(elementName: string) {
    super(
      `The "${elementName}" element must be the child of a configured "atomic-search-interface" element.`
    );
    this.name = 'InitializationError';
  }
}

export interface AtomicComponentInterface extends ComponentInterface {
  bindings: Bindings;
  error?: Error;
  strings?: Record<string, () => string>;
}

export function Initialization() {
  return (component: AtomicComponentInterface, initializeMethod: string) => {
    const {
      componentWillLoad,
      render,
      componentDidRender,
      componentDidLoad,
    } = component;
    const initialize: () => void = component[initializeMethod];

    component.componentWillLoad = function () {
      const element = getElement(this);
      const event = new CustomEvent('atomic/initializeComponent', {
        detail: (bindings: Bindings) => {
          this.bindings = bindings;
          if (this.strings) {
            this.bindings.i18n.on(
              'languageChanged',
              () => (this.strings = {...this.strings})
            );
          }

          try {
            initialize.call(this);
          } catch (error) {
            this.error = error;
          }
        },
        bubbles: true,
        cancelable: true,
      });

      const canceled = element.dispatchEvent(event);
      if (canceled) {
        this.error = new InitializationError(element.nodeName.toLowerCase());
        return;
      }

      return componentWillLoad && componentWillLoad.call(this);
    };

    let hasRendered = false;
    let hasLoaded = false;

    component.render = function () {
      if (this.error) {
        return (
          <atomic-component-error error={this.error}></atomic-component-error>
        );
      }

      if (!this.bindings) {
        // TODO: add optional renderLoad() method to render placeholders
        return `${getElement(this).nodeName.toLowerCase()}_loading`;
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
