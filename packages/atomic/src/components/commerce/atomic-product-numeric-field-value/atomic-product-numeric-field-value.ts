import {html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {createProductContextController} from '@/src/components/commerce/product-template-component-utils/context/product-context-controller.js';
import {bindingGuard} from '@/src/decorators/binding-guard.js';
import {bindings} from '@/src/decorators/bindings.js';
import {errorGuard} from '@/src/decorators/error-guard.js';
import type {InitializableComponent} from '@/src/decorators/types.js';
import {LightDomMixin} from '@/src/mixins/light-dom.js';
import {
  defaultNumberFormatter,
  type NumberFormatter,
} from '../../common/formats/format-common.js';
import type {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface.js';
import {parseValue} from '../product-template-component-utils/product-utils.js';

/**
 * The `atomic-product-numeric-field-value` component renders the value of a number product field.
 *
 * The number can be formatted by adding a `atomic-format-number`, `atomic-format-currency` or `atomic-format-unit` component into this component.
 */
@customElement('atomic-product-numeric-field-value')
@bindings()
export class AtomicProductNumericFieldValue
  extends LightDomMixin(LitElement)
  implements InitializableComponent<CommerceBindings>
{
  @state()
  bindings!: CommerceBindings;

  @state() error!: Error;

  private productController = createProductContextController(this);

  /**
   * The field that the component should use.
   * The component will try to find this field in the `Product.additionalFields` object unless it finds it in the `Product` object first.
   */
  @property({reflect: true}) field!: string;

  @state() private formatter: NumberFormatter = defaultNumberFormatter;

  initialize() {
    this.addEventListener(
      'atomic/numberFormat',
      this.setFormat as EventListener
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener(
      'atomic/numberFormat',
      this.setFormat as EventListener
    );
  }

  private setFormat = (event: Event) => {
    const customEvent = event as CustomEvent<NumberFormatter>;
    customEvent.preventDefault();
    customEvent.stopPropagation();
    this.formatter = customEvent.detail;
  };

  private get value() {
    const product = this.productController.item;

    if (!product) {
      return null;
    }
    const value = parseValue(product, this.field);
    if (value === null) {
      return null;
    }
    return this.formatter(value, this.bindings.i18n.languages as string[]);
  }

  @errorGuard()
  @bindingGuard()
  render() {
    return html`${when(this.value !== null, () => html`${this.value}`)}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-product-numeric-field-value': AtomicProductNumericFieldValue;
  }
}
