import type {Controller} from '@coveo/headless';
import type {ReactiveElement} from 'lit';
import type {InitializableComponent} from './types';

type ControllerProperties<T> = {
  [K in keyof T]: T[K] extends Controller ? K : never;
}[keyof T];

type Unsubscribe = () => void;

interface ControllerSubscription {
  subscribe: () => Unsubscribe;
  unsubscribe?: Unsubscribe;
}

const subscriptionsByComponent = new WeakMap<ReactiveElement, Set<ControllerSubscription>>();

/**
 * Returns the controller subscriptions of a component.
 *
 * The first call attaches a reactive controller that releases the subscriptions when the component
 * leaves the DOM and restores them when it comes back. Overriding `disconnectedCallback` on the
 * instance would not work: browsers invoke the lifecycle callbacks captured from the prototype when
 * the element was defined, so an instance override is never called.
 */
function getSubscriptions(component: ReactiveElement) {
  let subscriptions = subscriptionsByComponent.get(component);
  if (!subscriptions) {
    const newSubscriptions = new Set<ControllerSubscription>();
    subscriptionsByComponent.set(component, newSubscriptions);
    component.addController({
      hostConnected() {
        newSubscriptions.forEach((subscription) => {
          subscription.unsubscribe ??= subscription.subscribe();
        });
      },
      hostDisconnected() {
        newSubscriptions.forEach((subscription) => {
          subscription.unsubscribe?.();
          subscription.unsubscribe = undefined;
        });
      },
    });
    subscriptions = newSubscriptions;
  }
  return subscriptions;
}

function releaseSubscriptions(component: ReactiveElement) {
  const subscriptions = subscriptionsByComponent.get(component);
  subscriptions?.forEach((subscription) => subscription.unsubscribe?.());
  subscriptions?.clear();
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
 */
export function bindStateToController<Element extends ReactiveElement>(
  controllerProperty: ControllerProperties<Element>,
  options?: {
    /**
     * Component's method to be called when state is updated.
     */
    onUpdateCallbackMethod?: string;
  }
) {
  return <
    T extends Record<ControllerProperties<Element>, Controller> & Record<string, unknown>,
    Instance extends Element & T & InitializableComponent,
    K extends keyof Instance,
  >(
    proto: Element,
    stateProperty: K
  ) => {
    const ctor = proto.constructor as typeof ReactiveElement;

    ctor.addInitializer((instance) => {
      const component = instance as Instance;
      const {initialize} = component;

      component.initialize = function () {
        releaseSubscriptions(component);
        initialize?.call(this);

        if (!initialize) {
          return console.error(
            `ControllerState: The "initialize" method has to be defined and instantiate a controller for the property ${controllerProperty.toString()}`,
            component
          );
        }

        if (!component[controllerProperty]) {
          return console.error(
            `${controllerProperty.toString()} property is not defined on component`,
            component
          );
        }

        if (options?.onUpdateCallbackMethod && !component[options.onUpdateCallbackMethod]) {
          return console.error(
            `ControllerState: The onUpdateCallbackMethod property "${options.onUpdateCallbackMethod}" is not defined`,
            component
          );
        }

        const controller = component[controllerProperty];
        const updateCallback = options?.onUpdateCallbackMethod
          ? component[options.onUpdateCallbackMethod]
          : undefined;

        const subscription: ControllerSubscription = {
          subscribe: () =>
            controller.subscribe(() => {
              component[stateProperty] = controller.state as Instance[K];
              typeof updateCallback === 'function' && updateCallback();
            }),
        };
        if (component.isConnected) {
          subscription.unsubscribe = subscription.subscribe();
        }
        getSubscriptions(component).add(subscription);
      };
    });
  };
}
