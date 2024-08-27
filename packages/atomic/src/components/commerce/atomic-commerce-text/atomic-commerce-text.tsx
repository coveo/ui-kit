import {Component, Prop, State} from '@stencil/core';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';

/**
 * @alpha
 * The `atomic-commerce-text` component leverages the I18n translation module through the atomic-commerce-interface.
 */
@Component({
  tag: 'atomic-commerce-text',
  shadow: true,
})
export class AtomicCommerceText
  implements InitializableComponent<CommerceBindings>
{
  @InitializeBindings() public bindings!: CommerceBindings;

  private strings = {
    value: () =>
      this.bindings.i18n.t(this.value, {
        count: this.count,
      }),
  };
  @State() public error!: Error;

  /**
   * The string key value.
   */
  @Prop({reflect: true}) public value!: string;
  /**
   * The count value used for plurals.
   * @type {number}
   */
  @Prop({reflect: true}) public count?: number;

  public connectedCallback() {
    if (!this.value) {
      this.error = new Error('The "value" attribute must be defined.');
    }
  }

  public render() {
    return this.strings.value();
  }
}
