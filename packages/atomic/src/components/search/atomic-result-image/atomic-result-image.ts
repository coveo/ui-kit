import {Schema, StringValue} from '@coveo/bueno';
import type {Result} from '@coveo/headless';
import {ResultTemplatesHelpers} from '@coveo/headless';
import {css, html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit-html/directives/when.js';
import {ValidatePropsController} from '@/src/components/common/validate-props-controller/validate-props-controller';
import type {Bindings} from '@/src/components/search/atomic-search-interface/interfaces';
import {createResultContextController} from '@/src/components/search/result-template-component-utils/context/result-context-controller';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {LightDomMixin} from '@/src/mixins/light-dom';
import {filterProtocol} from '@/src/utils/xss-utils';

/**
 * The `atomic-result-image` component renders an image from a result field.
 */
@customElement('atomic-result-image')
@bindings()
export class AtomicResultImage
  extends LightDomMixin(LitElement)
  implements InitializableComponent<Bindings>
{
  static styles = css`
atomic-result-image {
  display: grid;
  place-items: center;
  grid-template-rows: 100%;
  width: 100%;
  height: 100%;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}
  `;

  /**
   * The result field which the component should use. This will look for the field in the Result object first, then in the Result.raw object. It is important to include the necessary field in the `atomic-search-interface` component.
   */
  @property({type: String, reflect: true}) field!: string;

  /**
   * The result field that contains the alt text for the image. This will look for the field in the Result object first, then in the Result.raw object.
   *
   * If the field is not specified, or does not contain a valid value, the alt text will be set to "Image for {productName}".
   */
  @property({type: String, reflect: true, attribute: 'image-alt-field'})
  imageAltField?: string;

  /**
   * An optional fallback image URL that will be used in case the specified image field is not available or encounters an error.
   */
  @property({type: String, reflect: true}) fallback?: string;

  @state() public bindings!: Bindings;

  @state() public error!: Error;

  @state() private result!: Result;

  @state() private useFallback = false;

  private resultController = createResultContextController(this);

  constructor() {
    super();

    new ValidatePropsController(
      this,
      () => ({field: this.field}),
      new Schema({
        field: new StringValue({required: true, emptyAllowed: false}),
      }),
      // TODO V4: KIT-5197 - Remove false
      false
    );
  }

  public initialize() {
    if (!this.result && this.resultController.item) {
      const item = this.resultController.item;
      if ('result' in item) {
        this.result = item.result;
      } else {
        this.result = item;
      }
    }
  }

  public get url() {
    const value = ResultTemplatesHelpers.getResultProperty(
      this.result,
      this.field
    );
    return Array.isArray(value) ? value[0] : value;
  }

  private get altText(): string {
    if (this.imageAltField) {
      const value = ResultTemplatesHelpers.getResultProperty(
        this.result,
        this.imageAltField
      );

      if (Array.isArray(value) && typeof value[0] === 'string') {
        return value[0];
      }

      if (typeof value === 'string') {
        return value;
      }
    }

    return this.bindings.i18n.t('image-alt-fallback', {
      itemName: this.result.title,
    });
  }

  private logWarning(message: string) {
    this.bindings.engine.logger.warn(message);
  }

  private handleImageError() {
    const message = `The image url "${this.url}" is not valid or could not be loaded. You might want to add a "fallback" property.`;

    if (this.fallback) {
      this.useFallback = true;
    } else {
      this.logWarning(message);
    }
  }

  private handleMissingFallback(message: string): string | null {
    if (!this.fallback) {
      this.logWarning(message);
      this.remove();
      return null;
    }
    return this.fallback;
  }

  private validateUrl(url: string): string | null {
    if (!url) {
      const message = `"${this.field}" is missing. Please review your indexation. You might want to add a "fallback" property.`;
      return this.handleMissingFallback(message);
    }

    if (typeof url !== 'string') {
      const message = `Expected "${this.field}" to be a text field. Please review your indexation. You might want to add a "fallback" property.`;
      return this.handleMissingFallback(message);
    }

    return url;
  }

  private renderImage() {
    let url = this.useFallback ? this.fallback : this.url;

    if (!this.useFallback) {
      url = this.validateUrl(url as string);
      if (!url) {
        return nothing;
      }
    }
    return html`      <img
        alt=${this.altText}
        src=${filterProtocol(url as string)}
        @error=${() => this.handleImageError()}
        loading="lazy"
      />
    `;
  }

  @bindingGuard()
  @errorGuard()
  render() {
    return html`${when(this.result, () => this.renderImage())}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-result-image': AtomicResultImage;
  }
}
