import {ContextConsumer} from '@lit/context';
import type {ReactiveElement} from 'lit';
import {bindingsContext} from '@/src/components/common/context/bindings-context';
import type {AnyBindings} from '@/src/components/common/interface/bindings';
import {
  findInterfaceParent,
  MissingInterfaceParentError,
} from '@/src/utils/initialization-common-utils';
import {logComponentError, renderComponentError} from './component-error';
import type {InitializableComponent} from './types';

const missingInterfaceError = Symbol('missingInterfaceError');

type BindingsHost = ReactiveElement &
  InitializableComponent<AnyBindings> & {
    [missingInterfaceError]?: MissingInterfaceParentError;
  };

type BindingsHostClass = Pick<typeof ReactiveElement, 'createProperty' | 'elementProperties'> & {
  prototype: BindingsHost;
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
 * It also owns the component error: `error` is a reactive property whether or not the class declares it,
 * every error is logged once, and an error replaces the component as soon as the component has its bindings,
 * or right away when the component has no parent interface to get bindings from.
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
  return (target: BindingsHostClass) => {
    if (!target.elementProperties?.has('error')) {
      target.createProperty('error', {state: true});
    }

    const prototype = target.prototype as unknown as {render?: () => unknown};
    const render = prototype.render;
    if (render) {
      prototype.render = function (this: BindingsHost) {
        const error = this.bindings ? this.error : this[missingInterfaceError];
        if (error) {
          logComponentError(error, this);
          return renderComponentError(this, error);
        }
        return render.call(this);
      };
    }

    const connectedCallback = target.prototype.connectedCallback;

    target.prototype.connectedCallback = function () {
      let hasProvider = false;

      new ContextConsumer(this, {
        context: bindingsContext,
        callback: (value) => {
          hasProvider = true;
          if (this[missingInterfaceError]) {
            this[missingInterfaceError] = undefined;
            this.requestUpdate();
          }

          if (this.initialized || Object.keys(value).length === 0) {
            return;
          }

          this.initialized = true;

          try {
            this.bindings = value;
            const updateLanguage = () => this.requestUpdate();
            this.bindings.i18n.on('languageChanged', updateLanguage);
            const unsubscribeLanguage = () =>
              this.bindings?.i18n.off('languageChanged', updateLanguage);

            this.initialize?.();

            this.unsubscribeLanguage = unsubscribeLanguage;
          } catch (error) {
            this.error = error as Error;
          }
        },
        subscribe: true,
      });

      if (connectedCallback) {
        connectedCallback.call(this);
      }

      if (!hasProvider && !this.initialized && !findInterfaceParent(this)) {
        const error = new MissingInterfaceParentError(this.nodeName.toLowerCase());
        if (SHOW_MISSING_INTERFACE_ERROR) {
          this[missingInterfaceError] = error;
          this.requestUpdate();
        } else {
          logComponentError(error, this);
        }
      }
    };

    const disconnectedCallback = target.prototype.disconnectedCallback;
    target.prototype.disconnectedCallback = function () {
      this.unsubscribeLanguage?.();
      if (disconnectedCallback) {
        disconnectedCallback.call(this);
      }
    };
  };
}
