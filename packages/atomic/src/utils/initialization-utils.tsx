import {Controller, Engine} from '@coveo/headless';
import {ComponentInterface, getElement, h} from '@stencil/core';
import {i18n} from 'i18next';

/**
 * Bindings passed from the `AtomicSearchInterface` to its children components.
 */
export interface Bindings {
  /**
   * Headless Engine instance.
   */
  engine: Engine;
  /**
   * i18n instance, for localization.
   */
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

/**
 * Necessary interface an Atomic Component must have to initialize itself correctly.
 */
export interface AtomicComponentInterface extends ComponentInterface {
  /**
   * Bindings passed from the `AtomicSearchInterface` to its children components.
   */
  bindings: Bindings;
  /**
   * Record of methods earch returning an i18n localized string.
   */
  strings?: Record<string, () => string>;
  /**
   * Headless Controller instance associated with the Atomic Component.
   */
  controller?: Controller;
  /**
   * Headless Controller's state.
   */
  controllerState?: unknown;
  /**
   * Callback for when the subscribe method is called and the controller's state is updated.
   */
  onControllerStateUpdate?: () => void;
}

/**
 * Utility that automatically fetches the `bindings` from the parent `atomic-search-interface` component. This decorator should be applied to the `initialize` method directly.
 *
 * In order for a component using this decorator to render properly, it should have an internal state property using data from the `bindings`. For more information, view the "Utilities" section of the readme.
 */
export function Initialization(options?: {
  resubscribeControllerOnConnectedCallback?: boolean;
}) {
  return (component: AtomicComponentInterface, initializeMethod: string) => {
    const {
      connectedCallback,
      componentWillLoad,
      render,
      componentDidRender,
      componentDidLoad,
      disconnectedCallback,
      onControllerStateUpdate,
    } = component;
    const initialize: () => void = component[initializeMethod];

    let unsubscribeStrings = () => {};
    let unsubscribeController = () => {};

    let error: Error;

    component.connectedCallback = function () {
      if (
        this.controller &&
        options?.resubscribeControllerOnConnectedCallback
      ) {
        unsubscribeController();
        unsubscribeController = this.controller.subscribe(() => {
          this.controllerState = this.controller!.state;
        });
      }
      connectedCallback && connectedCallback.call(this);
    };

    component.componentWillLoad = function () {
      const element = getElement(this);
      const event = new CustomEvent('atomic/initializeComponent', {
        detail: (bindings: Bindings) => {
          this.bindings = bindings;

          try {
            initialize.call(this);

            if (this.controller) {
              unsubscribeController = this.controller.subscribe(() => {
                this.controllerState = this.controller!.state;
                onControllerStateUpdate && onControllerStateUpdate.call(this);
              });
            }

            if (this.strings) {
              const updateStrings = () => (this.strings = {...this.strings});
              updateStrings(); // Ensures re-render of localized strings on initialization
              this.bindings.i18n.on('languageChanged', updateStrings);
              unsubscribeStrings = () =>
                this.bindings.i18n.off('languageChanged', updateStrings);
            }
          } catch (e) {
            error = e;
          }
        },
        bubbles: true,
        cancelable: true,
      });

      const canceled = element.dispatchEvent(event);
      if (canceled) {
        error = new InitializationError(element.nodeName.toLowerCase());
        return;
      }

      return componentWillLoad && componentWillLoad.call(this);
    };

    let hasRendered = false;
    let hasLoaded = false;

    component.render = function () {
      if (error) {
        return <atomic-component-error error={error}></atomic-component-error>;
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

    component.disconnectedCallback = function () {
      unsubscribeStrings();
      unsubscribeController();
      disconnectedCallback && disconnectedCallback.call(this);
    };
  };
}
