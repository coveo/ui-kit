import {
  type BreadcrumbManager,
  buildProductListing,
  buildSearch,
  type ProductListing,
  ProductTemplatesHelpers,
  type RegularFacetValue,
  type Search,
} from '@coveo/headless/commerce';
import {
  type CSSResultGroup,
  html,
  LitElement,
  nothing,
  type TemplateResult,
  unsafeCSS,
} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {createProductContextController} from '@/src/decorators/commerce/product-template-decorators';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {getFieldValueCaption} from '../../../utils/field-utils';
import {titleToKebab} from '../../../utils/utils';
import type {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';
import styles from './atomic-product-multi-value-text.tw.css';

/**
 * @alpha
 *
 * The `atomic-product-multi-value-text` component renders the values of a multi-value string field.
 *
 * @part product-multi-value-text-list - The list of field values.
 * @part product-multi-value-text-separator - The separator to display between each of the field values.
 * @part product-multi-value-text-value - A field value.
 * @part product-multi-value-text-value-more - A label indicating some values were omitted.
 * @slot product-multi-value-text-value-* - A custom caption value that's specified for a given part of a multi-text field value. For example, if you want to use `Off-Campus Resident` as a caption value for `Off-campus apartment` in `Off-campus apartment;On-campus apartment`, you'd use `<span slot="product-multi-value-text-value-off-campus-apartment">Off-Campus Resident</span>`). The suffix of this slot corresponds with the field value, written in kebab case.
 */
@customElement('atomic-product-multi-value-text')
@bindings()
@withTailwindStyles
export class AtomicProductMultiValueText
  extends LitElement
  implements InitializableComponent<CommerceBindings>
{
  static styles: CSSResultGroup = [unsafeCSS(styles)];

  @state()
  bindings!: CommerceBindings;

  @state()
  error!: Error;

  public breadcrumbManager!: BreadcrumbManager;

  private productController = createProductContextController(this);

  /**
   * The field that the component should use.
   * The component will try to find this field in the `Product.additionalFields` object unless it finds it in the `Product` object first.
   * Make sure this field is present in the `fieldsToInclude` property of the `atomic-commerce-interface` component.
   */
  @property({reflect: true})
  public field!: string;

  /**
   * The maximum number of field values to display.
   * If there are _n_ more values than the specified maximum, the last displayed value will be "_n_ more...".
   */
  @property({reflect: true, type: Number, attribute: 'max-values-to-display'})
  public maxValuesToDisplay = 3;

  /**
   * The delimiter used to separate values when the field isn't indexed as a multi value field.
   */
  @property({reflect: true})
  public delimiter: string | null = null;

  @state() private values: string[] = [];

  public initialize() {
    let searchOrListing: ProductListing | Search;

    if (this.bindings.interfaceElement.type === 'product-listing') {
      searchOrListing = buildProductListing(this.bindings.engine);
    } else {
      searchOrListing = buildSearch(this.bindings.engine);
    }

    this.breadcrumbManager = searchOrListing.breadcrumbManager();

    this.values = this.initializeValues();
  }

  private initializeValues(): string[] {
    const product = this.productController.item;
    if (!product) {
      return [];
    }
    const property = ProductTemplatesHelpers.getProductProperty(
      product,
      this.field
    );
    if (property === null) {
      return [];
    }
    if (Array.isArray(property)) {
      return property.map((v) => `${v}`.trim());
    }

    if (typeof property !== 'string' || property.trim() === '') {
      this.error = new Error(
        `Could not parse "${property}" from field "${this.field}" as a string array.`
      );
      return [];
    }

    return this.delimiter
      ? property.split(this.delimiter).map((value) => value.trim())
      : [property];
  }

  private get facetSelectedValues() {
    return this.breadcrumbManager.state.facetBreadcrumbs
      .filter((facet) => facet.field === this.field)
      .reduce((values, facet) => {
        return values.concat(
          facet.values.map(({value}) => (value as RegularFacetValue).value)
        );
      }, [] as string[]);
  }

  private get sortedValues() {
    const firstValues = this.facetSelectedValues.filter((value) =>
      this.values.includes(value)
    );

    return Array.from(new Set([...firstValues, ...this.values]));
  }

  private get shouldDisplayLabel() {
    return (
      this.maxValuesToDisplay > 0 &&
      this.sortedValues.length > this.maxValuesToDisplay
    );
  }

  private get numberOfValuesToDisplay() {
    return Math.min(this.sortedValues.length, this.maxValuesToDisplay);
  }

  private renderValue(value: string) {
    const label = getFieldValueCaption(this.field, value, this.bindings.i18n);
    const kebabValue = titleToKebab(value);
    return html`
      <li part="product-multi-value-text-value" class="inline-block">
        <slot name=${`product-multi-value-text-value-${kebabValue}`}>
          ${label}
        </slot>
      </li>
    `;
  }

  private renderSeparator() {
    return html`
      <li
        aria-hidden="true"
        part="product-multi-value-text-separator"
        class="separator inline-block"
      ></li>
    `;
  }

  private renderMoreLabel(value: number) {
    return html`
      <li part="product-multi-value-text-value-more" class="inline-block">
        ${this.bindings.i18n.t('n-more', {value})}
      </li>
    `;
  }

  private renderListItems(values: string[]) {
    const templates: TemplateResult[] = [];
    for (let i = 0; i < this.numberOfValuesToDisplay; i++) {
      if (i > 0) {
        templates.push(this.renderSeparator());
      }
      templates.push(this.renderValue(values[i]));
    }
    if (this.shouldDisplayLabel) {
      templates.push(this.renderSeparator());
      templates.push(
        this.renderMoreLabel(values.length - this.numberOfValuesToDisplay)
      );
    }
    return templates;
  }

  @bindingGuard()
  @errorGuard()
  render() {
    if (this.sortedValues.length === 0) {
      return html`${nothing}`;
    }

    return html`
      <ul part="product-multi-value-text-list" class="flex list-none m-0 p-0">
        ${this.renderListItems(this.sortedValues)}
      </ul>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-product-multi-value-text': AtomicProductMultiValueText;
  }
}
