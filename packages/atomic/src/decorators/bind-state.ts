import type {Controller} from '@coveo/headless';
import type {
  ReactiveController,
  ReactiveControllerHost,
  ReactiveElement,
} from 'lit';
import type {InitializableComponent} from './types';

type ControllerProperties<T> = {
  [K in keyof T]: T[K] extends Controller ? K : never;
}[keyof T];

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
      const stateController = new StateBindingController(instance);
      const {initialize} = component;

      component.initialize = function () {
        initialize && initialize.call(this);

        if (!initialize) {
          return console.error(
            `ControllerState: The "initialize" method has to be defined and instantiate a controller for the property ${controllerProperty.toString()}`,
            component.tagName
          );
        }

        if (!component[controllerProperty]) {
          return console.error(
            `${controllerProperty.toString()} property is not defined on component`,
            component.tagName
          );
        }

        if (
          options?.onUpdateCallbackMethod &&
          !component[options.onUpdateCallbackMethod]
        ) {
          return console.error(
            `ControllerState: The onUpdateCallbackMethod property "${options.onUpdateCallbackMethod}" is not defined`,
            component.tagName
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

        stateController.registerSubscription(unsubscribeController);
      };
    });
  };
}

export class StateBindingController implements ReactiveController {
  host: ReactiveControllerHost;
  private unsubscribeControllers: Array<() => void> = [];

  constructor(host: ReactiveControllerHost) {
    (this.host = host).addController(this);
  }

  registerSubscription(unsubscribe: () => void) {
    this.unsubscribeControllers.push(unsubscribe);
  }

  hostDisconnected() {
    this.unsubscribeControllers.forEach((unsubscribe) => unsubscribe());
    this.unsubscribeControllers = [];
  }
}
