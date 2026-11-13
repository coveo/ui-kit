import {ContextConsumer} from '@lit/context';
import type {LitElement} from 'lit';
import {bindingsContext} from '@/src/components/common/context/bindings-context';
import type {AnyBindings} from '@/src/components/common/interface/bindings';
import type {Constructor} from '@/src/mixins/mixin-common';
import {
  findInterfaceParent,
  MissingInterfaceParentError,
} from '@/src/utils/initialization-common-utils';
import {logComponentError, renderComponentError} from './component-error';
import type {InitializableComponent} from './types';

const bindingsConsumer = Symbol('bindingsConsumer');
const missingInterfaceError = Symbol('missingInterfaceError');

type BindingsHost = LitElement & InitializableComponent<AnyBindings>;

type BindingsElement = BindingsHost & {
  [missingInterfaceError]?: MissingInterfaceParentError;
};

/**
 * KIT-5099 prototype switch. `false` is the v3 behavior (console only), `true` the v4 one
 * (the component also renders the error).
 */
export const SHOW_MISSING_INTERFACE_ERROR = false;

/**
 * A decorator that will initialize the component with the bindings provided by the bindings context.
 * It ensures that the component is initialized only once and that the language is updated when the language changes.
 *
 * It also owns the component error: every error is logged once, and an error replaces the component as soon as
 * the component has its bindings, or right away when the component has no parent interface to get bindings from.
 *
 * The decorator returns a subclass of the decorated class, like a Lit class mixin applied last. The subclass creates
 * the `ContextConsumer` reactive controller as a class field, so the component's own controllers connect before the
 * bindings arrive, and it overrides `connectedCallback`, `disconnectedCallback` and `render`, calling `super` in each.
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
        checkInterfaceParent(this);
      }

      disconnectedCallback() {
        this.unsubscribeLanguage?.();
        super.disconnectedCallback();
      }

      render() {
        const error = this.bindings ? this.error : this[missingInterfaceError];
        if (error) {
          logComponentError(error, this);
          return renderComponentError(this, error);
        }
        return super.render();
      }
    };
}

function receiveBindings(host: BindingsHost, value: AnyBindings) {
  if (host.initialized || Object.keys(value).length === 0) {
    return;
  }

  host.initialized = true;

  try {
    host.bindings = value;
    const updateLanguage = () => host.requestUpdate();
    host.bindings.i18n.on('languageChanged', updateLanguage);
    const unsubscribeLanguage = () => host.bindings?.i18n.off('languageChanged', updateLanguage);

    host.initialize?.();

    host.unsubscribeLanguage = unsubscribeLanguage;
  } catch (error) {
    host.error = error as Error;
    logComponentError(host.error, host);
    host.requestUpdate();
  }
}

function checkInterfaceParent(host: BindingsElement) {
  if (host.bindings || findInterfaceParent(host)) {
    if (host[missingInterfaceError]) {
      host[missingInterfaceError] = undefined;
      host.requestUpdate();
    }
    return;
  }

  const error = new MissingInterfaceParentError(host.nodeName.toLowerCase());
  logComponentError(error, host);
  if (SHOW_MISSING_INTERFACE_ERROR) {
    host[missingInterfaceError] = error;
    host.requestUpdate();
  }
}
