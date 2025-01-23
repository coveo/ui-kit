import type {Controller} from '@coveo/headless';
import type {PropertyValues, ReactiveElement} from 'lit';
import type {InitializableComponent} from './types';

type ControllerProperties<T> = {
  [K in keyof T]: T[K] extends Controller ? K : never;
}[keyof T];

/**
 * Overrides the shouldUpdate method to prevent triggering an unnecessary updates when the controller state is not yet defined.
 *
 * This function wraps the original shouldUpdate method of a LitElement component. It ensures that the component
 * will only update if the original shouldUpdate method returns true and at least one of the changed properties
 * is not undefined.
 *
 * You can always defined a custom shouldUpdate method in your component which will override this one
 *
 * @param component - The LitElement component whose shouldUpdate method is being overridden.
 * @param shouldUpdate - The original shouldUpdate method of the component.
 */
function overrideShouldUpdate(
  component: ReactiveElement,
  shouldUpdate: (changedProperties: PropertyValues) => boolean
) {
  // @ts-expect-error - shouldUpdate is a protected property
  component.shouldUpdate = function (changedProperties: PropertyValues) {
    return (
      shouldUpdate.call(this, changedProperties) &&
      [...changedProperties.values()].some((v) => v !== undefined)
    );
  };
}

/**
 * A decorator that allows the Lit component state property to automatically get updates from a [Coveo Headless controller](https://docs.coveo.com/en/headless/latest/usage/#use-headless-controllers).
 *
 * @example
 * ```ts
 * @bindStateToController('pager') @state() private pagerState!: PagerState;
 * ```
 *
 * For more information and examples, view the "Utilities" section of the readme.
 *
 * @param controllerProperty The controller property to subscribe to. The controller has to be created inside of the `initialize` method.
 * @param options The configurable `bindStateToController` options.
 * TODO: KIT-3822: add unit tests to this decorator
 */
export function bindStateToController<Element extends ReactiveElement>( // TODO: check if can inject @state decorator
  controllerProperty: ControllerProperties<Element>,
  options?: {
    /**
     * Component's method to be called when state is updated.
     */
    onUpdateCallbackMethod?: string;
  }
) {
  return <
    T extends Record<ControllerProperties<Element>, Controller> &
      Record<string, unknown>,
    Instance extends Element & T & InitializableComponent,
    K extends keyof Instance,
  >(
    proto: Element,
    stateProperty: K
  ) => {
    const ctor = proto.constructor as typeof ReactiveElement;

    ctor.addInitializer((instance) => {
      const component = instance as Instance;
      // @ts-expect-error - shouldUpdate is a protected property
      const {disconnectedCallback, initialize, shouldUpdate} = component;

      overrideShouldUpdate(component, shouldUpdate);

      component.initialize = function () {
        initialize && initialize.call(this);

        if (!component[controllerProperty]) {
          return;
        }

        if (
          options?.onUpdateCallbackMethod &&
          !component[options.onUpdateCallbackMethod]
        ) {
          return console.error(
            `ControllerState: The onUpdateCallbackMethod property "${options.onUpdateCallbackMethod}" is not defined`,
            component
          );
        }

        const controller = component[controllerProperty];
        const updateCallback = options?.onUpdateCallbackMethod
          ? component[options.onUpdateCallbackMethod]
          : undefined;

        const unsubscribeController = controller.subscribe(() => {
          component[stateProperty] = controller.state as Instance[K];
          typeof updateCallback === 'function' && updateCallback();
        });

        component.disconnectedCallback = function () {
          !component.isConnected && unsubscribeController?.();
          disconnectedCallback && disconnectedCallback.call(component);
        };
      };
    });
  };
}
