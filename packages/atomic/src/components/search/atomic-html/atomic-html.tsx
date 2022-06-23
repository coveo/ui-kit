import {Component, Prop, State, h} from '@stencil/core';
import DOMPurify from 'dompurify';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../utils/initialization-utils';
import {Bindings} from '../atomic-search-interface/atomic-search-interface';

/**
 * The `atomic-html` component renders the HTML value of a string.
 *
 * There is an inherent XSS security concern associated with the usage of this component.
 *
 * Use only with values for which you are certain the content is harmless.
 */
@Component({
  tag: 'atomic-html',
  shadow: true,
})
export class AtomicHtml implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  @State() public error!: Error;

  /**
   * The string value containing HTML to display;
   */
  @Prop({reflect: false}) public value!: string;
  /**
   * Specify if the content should be sanitized, using [`DOMPurify`](https://www.npmjs.com/package/dompurify).
   */
  @Prop({reflect: true}) public sanitize = true;

  public connectedCallback() {
    if (!this.value) {
      this.error = new Error('The "value" attribute must be defined.');
    }
  }

  public render() {
    return (
      <span
        innerHTML={this.sanitize ? DOMPurify.sanitize(this.value) : this.value}
      ></span>
    );
  }
}
