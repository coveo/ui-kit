import {Schema, StringValue} from '@coveo/bueno';
import {html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {ValidatePropsController} from '@/src/components/common/validate-props-controller/validate-props-controller';
import {LightDomMixin} from '@/src/mixins/light-dom';

/**
 * The `atomic-tab` component represents an individual tab within the `atomic-tab-manager` component.
 * It must be used as a child of the `atomic-tab-manager` component to function correctly.
 *
 * @slot default - The default slot for any additional content within the tab (rarely used).
 */
@customElement('atomic-tab')
export class AtomicTab extends LightDomMixin(LitElement) {
  /**
   * The label to display on the tab.
   */
  @property({type: String, reflect: true}) label!: string;

  /**
   * The internal name of the atomic tab.
   */
  @property({type: String, reflect: true}) name!: string;

  /**
   * The [constant query expression (`cq`)](https://docs.coveo.com/en/2830/searching-with-coveo/about-the-query-expression#constant-query-expression-cq) to apply when the tab is the active one.
   */
  @property({type: String, reflect: true}) public expression: string = '';

  @state() public error!: Error;

  constructor() {
    super();

    new ValidatePropsController(
      this,
      () => ({
        label: this.label,
        name: this.name,
      }),
      new Schema({
        label: new StringValue({required: true, emptyAllowed: false}),
        name: new StringValue({required: true, emptyAllowed: false}),
      })
    );
  }

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-tab': AtomicTab;
  }
}
