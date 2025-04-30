import {ContextConsumer} from '@lit/context';
import {ReactiveElement} from 'lit';
import {AnyBindings} from '../components';
import {bindingsContext} from '../components/context/bindings-context';
import {InitializableComponent} from './types';

/**
 * A decorator that will initialize the component with the bindings provided by the bindings context.
 * It ensures that the component is initialized only once and that the language is updated when the language changes.
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
 *    @state() public bindings: Bindings = {} as Bindings;
 *    @state() public error!: Error;
 *
 *    public initialized = false;
 *
 *    public render() {
 *     return html``;
 *    }
 * }
 * ```
 */
export function bindings() {
  return function (target: {
    prototype: ReactiveElement & InitializableComponent<AnyBindings>;
  }) {
    const connectedCallback = target.prototype.connectedCallback;

    target.prototype.connectedCallback = function () {
      new ContextConsumer(this, {
        context: bindingsContext,
        callback: (value) => {
          if (
            this.initialized ||
            typeof value !== 'object' ||
            Object.keys(value).length === 0
          ) {
            return;
          }

          this.initialized = true;

          this.bindings = value;
          const updateLanguage = () => this.requestUpdate();
          this.bindings.i18n.on('languageChanged', updateLanguage);
          const unsubscribeLanguage = () =>
            this.bindings?.i18n.off('languageChanged', updateLanguage);

          this.initialize?.();

          this.unsubscribeLanguage = unsubscribeLanguage;
        },
        subscribe: true,
      });

      if (connectedCallback) {
        connectedCallback.call(this);
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
