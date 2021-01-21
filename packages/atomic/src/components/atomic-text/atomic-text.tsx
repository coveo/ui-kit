import {Component, Prop, State} from '@stencil/core';
import {
  AtomicComponentInterface,
  Bindings,
  Initialization,
} from '../../utils/initialization-utils';

@Component({
  tag: 'atomic-text',
  shadow: true,
})
export class AtomicText implements AtomicComponentInterface {
  /**
   * String key value
   */
  @Prop() value!: string;
  /**
   * Count value used for plurals
   */
  @Prop() count?: number;
  /**
   *  Used for contexts (eg. male/female)
   */
  @Prop() context?: string;

  @State() public strings = {
    value: () =>
      this.bindings.i18n.t(this.value, {
        count: this.count,
        context: this.context,
      }),
  };

  public bindings!: Bindings;
  public error?: Error;

  connectedCallback() {
    if (!this.value) {
      this.error = new Error('The "value" attribute must be defined.');
    }
  }

  @Initialization()
  public initialize() {}

  render() {
    return this.strings.value();
  }
}
