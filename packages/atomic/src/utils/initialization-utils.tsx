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

export interface AtomicComponentInterface extends ComponentInterface {
  context: InterfaceContext;
  error?: Error;
  updateLocaleStrings?: () => void;
}

export function Initialization() {
  return (component: AtomicComponentInterface, initializeMethod: string) => {
    const {
      componentWillLoad,
      render,
      componentDidRender,
      componentDidLoad,
      updateLocaleStrings,
    } = component;
    const initialize: () => void = component[initializeMethod];

    component.componentWillLoad = function () {
      const element = getElement(this);
      const event = new CustomEvent('atomic/initializeComponent', {
        detail: (context: InterfaceContext) => {
          this.context = context;
          if (updateLocaleStrings) {
            updateLocaleStrings.call(this);
            this.context.i18n.on('languageChanged', () =>
              updateLocaleStrings.call(this)
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

      if (!this.context) {
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
