import {SearchEngine} from '@coveo/headless';
import {ComponentInterface, getElement, h, forceUpdate} from '@stencil/core';
import {i18n, TOptions} from 'i18next';
import {ObservableMap} from '@stencil/store';
import {buildCustomEvent} from './event-utils';
import {AtomicStore} from './store';
import {Hidden} from '../components/common/hidden';
import {AtomicSearchInterface} from '../components/atomic-search-interface/atomic-search-interface';

declare global {
  interface Window {
    applyFocusVisiblePolyfill?: (shadowRoot: ShadowRoot) => void;
  }
}

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
  /**
   * A reference to the `AtomicSearchInterface` component.
   */
  interfaceComponent: AtomicSearchInterface;
}

export type InitializeEventHandler = (bindings: Bindings) => void;
export type InitializeEvent = CustomEvent<InitializeEventHandler>;
export const initializeEventName = 'atomic/initializeComponent';
const initializableElements = ['atomic-search-interface', 'atomic-external'];

/**
 * Retrieves `Bindings` on a configured parent search interface.
 * @param event Element on which to dispatch the event, which must be the child of a configured "atomic-search-interface" or "atomic-external" element.
 * @returns A promise that resolves on initialization of the parent "atomic-search-interface" or "atomic-external" element, and rejects when it's not the case.
 */
export const initializeBindings = (element: Element) =>
  new Promise<Bindings>((resolve, reject) => {
    const event = buildCustomEvent<InitializeEventHandler>(
      initializeEventName,
      (bindings: Bindings) => resolve(bindings)
    );
    element.dispatchEvent(event);

    if (!element.closest(initializableElements.join(', '))) {
      reject(new MissingInterfaceParentError(element.nodeName.toLowerCase()));
    }
  });

export class MissingInterfaceParentError extends Error {
  constructor(elementName: string) {
    super(
      `The "${elementName}" element must be the child of the following elements: ${initializableElements.join(
        ', '
      )}`
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

export function applyFocusVisiblePolyfill(element: HTMLElement) {
  if (window.applyFocusVisiblePolyfill && element.shadowRoot) {
    window.applyFocusVisiblePolyfill(element.shadowRoot);
  }
}

/**
 * A [StencilJS property decorator](https://stenciljs.com/) to be used on a property named `bindings`.
 * This will automatically fetch the `Bindings` from the parent `atomic-search-interface` or `atomic-extarnal` components.
 *
 * Once a component is bound, the `initialize` method is called.
 * In the event of an initialization error, the `error` property will be set and an `atomic-component-error` will be rendered.
 *
 * In order for a component using this decorator to render properly, it should have an internal state bound to one of the properties from `bindings`.
 * This is possible by using the `BindStateToController` decorator.
 *
 * @example
 * @InitializeBindings() public bindings!: Bindings;
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
        initializeEventName,
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
            this.error = e as Error;
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
        return <Hidden></Hidden>;
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

    component.componentDidLoad = function () {
      applyFocusVisiblePolyfill(getElement(this));
    };
  };
}

/**
 * A [StencilJS property decorator](https://stenciljs.com/) is used together with the [State decorator](https://stenciljs.com/docs/state#state-decorator).
 * This allows the Stencil component state property to automatically get updates from a [Coveo Headless controller](https://docs.coveo.com/en/headless/latest/usage/#use-headless-controllers).
 *
 * @example
 * @BindStateToController('pager') @State() private pagerState!: PagerState;
 *
 * For more information and examples, view the "Utilities" section of the readme.
 *
 * @param controllerProperty The controller property to subscribe to. The controller has to be created inside of the `initialize` method.
 * @param options The configurable `BindStateToController` options.
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

interface DeferredExecution {
  args: unknown[];
}

export function DeferUntilRender() {
  return (component: ComponentInterface, methodName: string) => {
    const {componentDidRender, connectedCallback} = component;
    const originalMethod = component[methodName] as Function;
    let deferredExecutions: DeferredExecution[] = [];

    component.connectedCallback = function () {
      this[methodName] = function (...args: unknown[]) {
        deferredExecutions.push({args});
      };
      connectedCallback && connectedCallback.call(this);
    };

    component.componentDidRender = function () {
      deferredExecutions.forEach(({args}) =>
        originalMethod.call(this, ...args)
      );
      deferredExecutions = [];
      componentDidRender && componentDidRender.call(this);
    };
  };
}

export type I18nState = Record<string, (variables?: TOptions) => string>;
