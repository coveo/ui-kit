import {Schema, StringValue} from '@coveo/bueno';
import DOMPurify from 'dompurify';
import {html, LitElement, type PropertyValues} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {bindings} from '@/src/decorators/bindings.js';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import type {Bindings} from '../atomic-search-interface/atomic-search-interface';
import {createBooleanConverter} from '@/src/converters/boolean-converter';
import {DeprecatedPropertyWarnings} from '@/src/utils/deprecation-utils';

/**
 * The `atomic-html` component renders the HTML value of a string.
 *
 * There is an inherent XSS security concern associated with the usage of this component.
 *
 * Use only with values for which you are certain the content is harmless.
 */
@customElement('atomic-html')
@bindings()
@withTailwindStyles
export class AtomicHtml extends LitElement implements InitializableComponent<Bindings> {
  private deprecatedPropertyWarnings = new DeprecatedPropertyWarnings(this, [
    {
      property: 'sanitize',
      attribute: 'sanitize',
      defaultValue: true,
      instruction:
        'Use `disable-sanitization` instead. Setting the attribute to `"false"` has no effect.',
      onlyWhenFalse: true,
    },
  ]);

  willUpdate(changedProperties: PropertyValues) {
    super.willUpdate(changedProperties);
    this.deprecatedPropertyWarnings.track(changedProperties);
    this.deprecatedPropertyWarnings.warn(this.bindings?.engine?.logger);
  }

  @state() bindings!: Bindings;
  @state() public error?: Error;

  /**
   * The string value containing HTML to display;
   */
  @property({type: String, reflect: false}) value!: string;
  /**
   * Specify if the content should be sanitized, using [`DOMPurify`](https://www.npmjs.com/package/dompurify).
   * @deprecated - Use `disable-sanitization` instead (this defaults to `true`, while the replacement defaults to `false`).
   */
  @property({
    type: Boolean,
    reflect: true,
    converter: createBooleanConverter('disable-sanitization', {ignoreFalse: true, silent: true}),
  })
  sanitize = true;

  /**
   * Whether to render the HTML content without sanitizing it.
   * Only set this when the content comes from a trusted source.
   */
  @property({type: Boolean, attribute: 'disable-sanitization', reflect: true})
  public disableSanitization = false;

  public initialize() {
    this.validateProps();
  }

  @errorGuard()
  public render() {
    return html`<span
      .innerHTML=${this.shouldSanitize ? DOMPurify.sanitize(this.value) : this.value}
    ></span>`;
  }

  private static readonly propsSchema = new Schema({
    value: new StringValue({emptyAllowed: false}),
  });

  private validateProps() {
    AtomicHtml.propsSchema.validate({
      value: this.value,
    });
  }

  private get shouldSanitize() {
    return this.sanitize && !this.disableSanitization;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-html': AtomicHtml;
  }
}
