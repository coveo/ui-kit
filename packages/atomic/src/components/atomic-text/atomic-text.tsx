import {Component, Prop, State} from '@stencil/core';
import {
  InitializableComponent,
  Bindings,
  InitializeBindings,
  BindStateToI18n,
} from '../../utils/initialization-utils';

/**
 * The `atomic-text` component leverages the I18n translation module through the atomic-search-interface.
 */
@Component({
  tag: 'atomic-text',
  shadow: true,
})
export class AtomicText implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;

  @BindStateToI18n() @State() private strings = {
    value: () =>
      this.bindings.i18n.t(this.value, {
        count: this.count,
      }),
  };
  @State() public error!: Error;

  /**
   * String key value
   */
  @Prop() public value!: string;
  /**
   * Count value used for plurals
   */
  @Prop() public count?: number;

  public connectedCallback() {
    if (!this.value) {
      this.error = new Error('The "value" attribute must be defined.');
    }
  }

  public render() {
    return this.strings.value();
  }
}
