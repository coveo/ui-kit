import type {ReactiveElement} from 'lit';
import type {AnyBindings} from '../components/common/interface/bindings';
import {closest} from '../utils/dom-utils';
import {buildCustomEvent} from '../utils/event-utils';
import {
  initializableElements,
  InitializeEventHandler,
  initializeEventName,
  MissingInterfaceParentError,
} from '../utils/initialization-lit-stencil-common-utils';
import type {InitializableComponent} from './types';

function fetchBindings<SpecificBindings extends AnyBindings>(element: Element) {
  return new Promise<SpecificBindings>((resolve, reject) => {
    const event = buildCustomEvent<InitializeEventHandler>(
      initializeEventName,
      (bindings: unknown) => resolve(bindings as SpecificBindings)
    );
    element.dispatchEvent(event);

    if (!closest(element, initializableElements.join(', '))) {
      reject(new MissingInterfaceParentError(element.nodeName.toLowerCase()));
    }
  });
}

/**
 * Retrieves `Bindings` or `CommerceBindings` on a configured parent interface.
 * @param event - The element on which to dispatch the event, which must be the child of a configured Atomic container element.
 * @returns A promise that resolves upon initialization of the parent container element, and rejects otherwise.
 * TODO: KIT-3822: add unit tests to this decorator
 */
export const initializeBindings =
  () =>
  <SpecificBindings extends AnyBindings>(
    proto: ReactiveElement,
    bindingsProperty: string
  ) => {
    type InstanceType<SpecificBindings extends AnyBindings> = ReactiveElement &
      InitializableComponent<SpecificBindings>;

    const ctor = proto.constructor as typeof ReactiveElement;
    const host = {
      _instance: null as InstanceType<SpecificBindings> | null,
      get: () => host._instance,
      set: (instance: InstanceType<SpecificBindings>) => {
        host._instance = instance;
      },
    };

    let unsubscribeLanguage = () => {};

    proto.addController({
      hostConnected() {
        const instance = host.get();
        if (!instance) {
          return;
        }

        fetchBindings<SpecificBindings>(instance)
          .then((bindings) => {
            instance.bindings = bindings;

            const updateLanguage = () => instance.requestUpdate();
            instance.bindings.i18n.on('languageChanged', updateLanguage);
            unsubscribeLanguage = () =>
              instance.bindings.i18n.off('languageChanged', updateLanguage);

            instance.initialize?.();
          })
          .catch((error) => {
            instance.error = error;
          });
      },
      hostDisconnected() {
        unsubscribeLanguage();
      },
    });

    ctor.addInitializer((instance) => {
      host.set(instance as InstanceType<SpecificBindings>);
      if (bindingsProperty !== 'bindings') {
        return console.error(
          `The InitializeBindings decorator should be used on a property called "bindings", and not "${bindingsProperty}"`,
          instance
        );
      }
    });
  };
