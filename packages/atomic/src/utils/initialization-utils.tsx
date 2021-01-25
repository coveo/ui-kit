import {Engine} from '@coveo/headless';
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

export class MissingInterfaceParentError extends Error {
  constructor(elementName: string) {
    super(
      `The "${elementName}" element must be the child of a configured "atomic-search-interface" element.`
    );
  }
}

/**
 * Necessary interface an Atomic Component must have to initialize itself correctly.
 */
export interface InitializableComponent extends ComponentInterface {
  /**
   * Bindings passed from the `AtomicSearchInterface` to its children components.
   */
  bindings: Bindings;
  /**
   * Initialization method.
   */
  initialize?: () => void;
}

/**
 * Utility that automatically fetches the `bindings` from the parent `atomic-search-interface` component.
 *
 * In order for a component using this decorator to render properly once it uses Bindings, it should have an internal state property using data from the `bindings`. For more information, view the "Utilities" section of the readme.
 *
 * Once a component is bound, the `initialize` method is called, if defined.
 */
export function InitializeBindings() {
  return (component: InitializableComponent, bindingsProperty: string) => {
    const {
      componentWillLoad,
      render,
      componentDidRender,
      componentDidLoad,
    } = component;

    if (bindingsProperty !== 'bindings') {
      return console.error(
        `The Bindings decorator should be used on a property called "bindings", and not "${bindingsProperty}"`,
        component
      );
    }

    component.componentWillLoad = function () {
      const element = getElement(this);
      const event = new CustomEvent('atomic/initializeComponent', {
        detail: (bindings: Bindings) => {
          this.bindings = bindings;

          try {
            this.initialize && this.initialize();
          } catch (e) {
            this.error = e;
          }
        },
        // Event will bubble up the DOM until it is caught
        bubbles: true,
        // Allows to verify if event is caught (cancelled). If it's not caught, it won't be initialized.
        cancelable: true,
        // Allows to compose Atomic components inside one another, event will go across DOM/Shadow DOM
        composed: true,
      });

      const canceled = element.dispatchEvent(event);
      if (canceled) {
        this.error = new MissingInterfaceParentError(
          element.nodeName.toLowerCase()
        );
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
    };

    component.componentDidLoad = function () {};
  };
}

/**
 * Decorator to be used on a property... TODO: document
 * @param controllerProperty
 * @param options
 */
export function BindStateToController(
  controllerProperty: string,
  options?: {
    /**
     * Wether the component should resubscribe when disconnected and reconnected from the DOM
     */
    subscribeOnConnectedCallback?: boolean;
    /**
     * Component's method to be called when state is updated.
     */
    onUpdateCallbackMethod?: string;
  }
) {
  return (component: InitializableComponent, stateProperty: string) => {
    const {connectedCallback, disconnectedCallback, initialize} = component;
    let unsubscribe = () => {};

    component.connectedCallback = function () {
      if (options?.subscribeOnConnectedCallback && this[controllerProperty]) {
        unsubscribe = this[controllerProperty].subscribe(() => {
          this[stateProperty] = this[controllerProperty].state;
          options?.onUpdateCallbackMethod &&
            this[options.onUpdateCallbackMethod] &&
            this[options.onUpdateCallbackMethod]();
        });
      }
      connectedCallback && connectedCallback.call(this);
    };

    component.initialize = function () {
      initialize && initialize.call(this);

      if (!this.initialize) {
        return console.error(
          `ControllerState: The "initialize" method has to be defined and instanciate a controller for the property ${controllerProperty}`,
          component
        );
      }

      if (!this[controllerProperty]) {
        return console.error(
          `ControllerState: The controller property "${controllerProperty}" is not defined`,
          component
        );
      }

      if (
        options?.onUpdateCallbackMethod &&
        !this[options.onUpdateCallbackMethod]
      ) {
        return console.error(
          `ControllerState: The onUpdateCallbackMethod property "${options.onUpdateCallbackMethod}" is not defined`,
          component
        );
      }

      unsubscribe = this[controllerProperty].subscribe(() => {
        this[stateProperty] = this[controllerProperty].state;
        options?.onUpdateCallbackMethod &&
          this[options.onUpdateCallbackMethod]();
      });
    };

    component.disconnectedCallback = function () {
      unsubscribe();
      disconnectedCallback && disconnectedCallback.call(this);
    };
  };
}

export type I18nState = Record<string, () => string>;

/**
 * TODO: document
 */
export function BindStateToI18n() {
  return (component: InitializableComponent, stateProperty: string) => {
    const {disconnectedCallback, initialize} = component;
    let unsubscribe = () => {};

    component.initialize = function () {
      const updateStrings = () => {
        this[stateProperty] = {...this[stateProperty]};
      };
      updateStrings(); // Ensures re-render of localized strings on initialization
      this.bindings.i18n.on('languageChanged', updateStrings);
      unsubscribe = () =>
        this.bindings.i18n.off('languageChanged', updateStrings);

      initialize && initialize.call(this);
    };

    component.disconnectedCallback = function () {
      unsubscribe();
      disconnectedCallback && disconnectedCallback.call(this);
    };
  };
}
