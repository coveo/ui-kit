import {html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import type {Bindings} from '../atomic-search-interface/atomic-search-interface';

/**
 * The `atomic-text` component leverages the I18n translation module through the atomic-search-interface.
 */
@customElement('atomic-text')
@bindings()
export class AtomicText
  extends LitElement
  implements InitializableComponent<Bindings>
{
  @state() bindings!: Bindings;
  @state() error!: Error;

  /**
   * The string key value.
   */
  @property({type: String, reflect: true}) value!: string;
  /**
   * The count value used for plurals.
   * @type {number}
   */
  @property({type: Number, reflect: true}) count?: number;

  private get strings() {
    return {
      value: () =>
        this.bindings.i18n.t(this.value, {
          count: this.count,
        }),
    };
  }

  public initialize() {
    if (!this.value) {
      this.error = new Error('The "value" attribute must be defined.');
    }
  }

  @bindingGuard()
  @errorGuard()
  render() {
    return html`${this.strings.value()}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-text': AtomicText;
  }
}
