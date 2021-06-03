import {Engine} from '@coveo/headless';
import {ComponentInterface, getElement, h} from '@stencil/core';
import {i18n, TOptions} from 'i18next';
import {ObservableMap} from '@stencil/store';
import {buildCustomEvent} from './event-utils';

export type FacetState = {
  label: string;
  formatting?: string;
};

export type AtomicStore = {
  facets: Record<string, FacetState>;
};

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
  /**
   * Global state for Atomic
   */
  store: ObservableMap<AtomicStore>;
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
   * Method called right after the `bindings` property is defined. This is the method where Headless Framework controllers should be initialized.
   */
  initialize?: () => void;
  error: Error;
}

/**
 * Utility that automatically fetches the `Bindings` from the parent `AtomicSearchInterface` component.
 * Once a component is bound, the `initialize` method is called, if defined.
 *
 * In order for a component using this decorator to render properly, it should have an internal state bound to one of the property from `bindings`.
 * This is possible by using either the `BindStateToController` or the `BindStateToI18n` decorator.
 *
 * For more information and examples, view the "Utilities" section of the readme.
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
        `The InitializeBindings decorator should be used on a property called "bindings", and not "${bindingsProperty}"`,
        component
      );
    }

    component.componentWillLoad = function () {
      const element = getElement(this);
      const event = buildCustomEvent(
        'atomic/initializeComponent',
        (bindings: Bindings) => {
          this.bindings = bindings;

          try {
            this.initialize && this.initialize();
          } catch (e) {
            this.error = e;
          }
        }
      );

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
          <atomic-component-error
            element={getElement(this)}
            error={this.error}
          ></atomic-component-error>
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
 * Decorator to be used on a property decorator with Stencil's `State` that will be subscribed automatically to a Headless Framework controller.
 * @param controllerProperty The controller property to subscribe to. The controller has to be defined inside the `initialize` method.
 * @param options
 */
export function BindStateToController(
  controllerProperty: string,
  options?: {
    /**
     * Whether the component should resubscribe when disconnected and reconnected from the DOM
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

      if (!initialize) {
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

export type I18nState = Record<string, (variables?: TOptions) => string>;

/**
 * Decorator to be used on a property decorator with Stencil's `State` that will be subscribed automatically to the i18next language change.
 * The state should be of the `I18nState` format and use the `i18n` binding to retrieve strings.
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
