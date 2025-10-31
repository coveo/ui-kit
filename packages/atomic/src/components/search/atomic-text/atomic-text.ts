import {NumberValue, Schema, StringValue} from '@coveo/bueno';
import {html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {ValidatePropsController} from '@/src/components/common/validate-props-controller/validate-props-controller';
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
  @state() public bindings!: Bindings;
  @state() public error!: Error;

  /**
   * The string key value.
   */
  @property({type: String, reflect: true}) public value!: string;
  /**
   * The count value used for plurals.
   * @type {number}
   */
  @property({type: Number, reflect: true}) public count?: number;

  constructor() {
    super();

    new ValidatePropsController(
      this,
      () => ({
        value: this.value,
        count: this.count,
      }),
      new Schema({
        value: new StringValue({required: true, emptyAllowed: false}),
        count: new NumberValue({required: false}),
      })
    );
  }

  private get strings() {
    return {
      value: () =>
        this.bindings.i18n.t(this.value, {
          count: this.count,
        }),
    };
  }

  public initialize() {}

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
