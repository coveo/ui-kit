import {ContextConsumer} from '@lit/context';
import type {LitElement} from 'lit';
import {bindingsContext} from '@/src/components/common/context/bindings-context';
import type {AnyBindings} from '@/src/components/common/interface/bindings';
import type {Constructor} from '@/src/mixins/mixin-common';
import {
  findInterfaceParent,
  MissingInterfaceParentError,
} from '@/src/utils/initialization-common-utils';
import {logComponentError} from './component-error';
import type {InitializableComponent} from './types';

const bindingsConsumer = Symbol('bindingsConsumer');
const missingInterfaceError = Symbol('missingInterfaceError');

type BindingsHost = LitElement & InitializableComponent<AnyBindings>;

type BindingsElement = BindingsHost & {
  [missingInterfaceError]?: MissingInterfaceParentError;
};

/**
 * A decorator that will initialize the component with the bindings provided by the bindings context.
 * It ensures that the component is initialized only once and that the language is updated when the language changes.
 *
 * When `initialize()` throws, the decorator sets the `error` property, logs the error and requests an update.
 * When the component connects outside of an Atomic interface, the decorator logs a `MissingInterfaceParentError`.
 *
 * The decorator returns a subclass of the decorated class. The subclass creates its `ContextConsumer` once, as a
 * class field, so the component's own controllers connect before `initialize()` runs.
 * Place the decorator below `@customElement` so that the subclass is the class that gets registered.
 *
 * @example
 * ```ts
 * import {bindings} from './decorators/bindings';
 * import {InitializableComponent} from './decorators/types';
 *
 * @customElement('test-element')
 * @bindings()
 * export class TestElement extends LitElement implements InitializableComponent<Bindings> {
 *
 *    @state() public bindings!: Bindings;
 *    @state() public error!: Error;
 *
 *    public initialized = false;
 *
 *    public initialize() {}
 *
 *    public render() {
 *     return html``;
 *    }
 * }
 * ```
 */
export function bindings() {
  return <T extends Constructor<BindingsHost>>(Base: T): T =>
    class extends Base {
      [missingInterfaceError]?: MissingInterfaceParentError;

      [bindingsConsumer] = new ContextConsumer(this, {
        context: bindingsContext,
        callback: (value) => receiveBindings(this, value),
        subscribe: true,
      });

      connectedCallback() {
        super.connectedCallback();
        if (this.initialized && this.bindings && !this.unsubscribeLanguage) {
          subscribeToLanguage(this);
        }
        checkInterfaceParent(this);
      }

      disconnectedCallback() {
        this.unsubscribeLanguage?.();
        this.unsubscribeLanguage = undefined;
        super.disconnectedCallback();
      }
    };
}

function receiveBindings(host: BindingsElement, value: AnyBindings) {
  if (host.initialized || Object.keys(value).length === 0) {
    return;
  }

  host.initialized = true;
  host[missingInterfaceError] = undefined;

  try {
    host.bindings = value;
    subscribeToLanguage(host);
    host.initialize?.();
  } catch (error) {
    host.error = error instanceof Error ? error : new Error(String(error));
    logComponentError(host.error, host);
    host.requestUpdate();
  }
}

function subscribeToLanguage(host: BindingsHost) {
  const updateLanguage = () => host.requestUpdate();
  host.bindings.i18n.on('languageChanged', updateLanguage);
  host.unsubscribeLanguage = () => host.bindings?.i18n.off('languageChanged', updateLanguage);
}

function checkInterfaceParent(host: BindingsElement) {
  if (host.initialized || findInterfaceParent(host)) {
    host[missingInterfaceError] = undefined;
    return;
  }

  host[missingInterfaceError] = new MissingInterfaceParentError(host.nodeName.toLowerCase());
  logComponentError(host[missingInterfaceError], host);
}
