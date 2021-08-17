import {SearchEngine} from '@coveo/headless';
import {ComponentInterface, getElement, h, forceUpdate} from '@stencil/core';
import {i18n, TOptions} from 'i18next';
import {ObservableMap} from '@stencil/store';
import {buildCustomEvent} from './event-utils';
import {AtomicStore} from './store';

/**
 * Bindings passed from the `AtomicSearchInterface` to its children components.
 */
export interface Bindings {
  /**
   * A headless search engine instance.
   */
  engine: SearchEngine;
  /**
   * i18n instance, for localization.
   */
  i18n: i18n;
  /**
   * Global state for Atomic
   */
  store: ObservableMap<AtomicStore>;
  /**
   * A reference to the `AtomicSearchInterface` element.
   */
  interfaceElement: HTMLElement;
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
 * This is possible by using the `BindStateToController` decorator.
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
      disconnectedCallback,
    } = component;
    let unsubscribeLanguage = () => {};

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

          const updateLanguage = () => forceUpdate(this);
          this.bindings.i18n.on('languageChanged', updateLanguage);
          unsubscribeLanguage = () =>
            this.bindings.i18n.off('languageChanged', updateLanguage);

          try {
            // When no controller is initialized, updating a property with a State() decorator, there will be no re-render.
            // In this case, we have to manually trigger it.
            this.initialize ? this.initialize() : forceUpdate(this);
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

    component.disconnectedCallback = function () {
      unsubscribeLanguage();
      disconnectedCallback && disconnectedCallback.call(this);
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
     * Component's method to be called when state is updated.
     */
    onUpdateCallbackMethod?: string;
  }
) {
  return (component: InitializableComponent, stateProperty: string) => {
    const {disconnectedCallback, initialize} = component;
    let unsubscribeController = () => {};

    component.initialize = function () {
      initialize && initialize.call(this);

      if (!initialize) {
        return console.error(
          `ControllerState: The "initialize" method has to be defined and instanciate a controller for the property ${controllerProperty}`,
          component
        );
      }

      if (!this[controllerProperty]) {
        return;
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

      unsubscribeController = this[controllerProperty].subscribe(() => {
        this[stateProperty] = this[controllerProperty].state;
        options?.onUpdateCallbackMethod &&
          this[options.onUpdateCallbackMethod]();
      });
    };

    component.disconnectedCallback = function () {
      !getElement(this).isConnected && unsubscribeController();
      disconnectedCallback && disconnectedCallback.call(this);
    };
  };
}

export type I18nState = Record<string, (variables?: TOptions) => string>;
