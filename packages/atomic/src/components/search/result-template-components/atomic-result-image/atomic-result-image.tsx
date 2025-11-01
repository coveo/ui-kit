import {Result, ResultTemplatesHelpers} from '@coveo/headless';
import {Component, h, Prop, Element, State} from '@stencil/core';
import {
  InitializeBindings,
  InitializableComponent,
} from '../../../../utils/initialization-utils';
import {filterProtocol} from '../../../../utils/xss-utils';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';
import {ResultContext} from '@/src/components/search/result-template-component-utils/context/stencil-result-template-decorators';

/**
 * The `atomic-result-image` component renders an image from a result field.
 */
@Component({
  tag: 'atomic-result-image',
  styleUrl: 'atomic-result-image.pcss',
  shadow: false,
})
export class AtomicResultImage implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  @ResultContext() private result!: Result;
  @Element() private host!: HTMLElement;
  @State() private useFallback = false;

  /**
   * The result field which the component should use. This will look for the field in the Result object first, then in the Result.raw object. It is important to include the necessary field in the `atomic-search-interface` component.
   */
  @Prop({reflect: true}) field!: string;

  /**
   * The result field that contains the alt text for the image. This will look for the field in the Result object first, then in the Result.raw object
   *
   * If the field is not specified, or does not contain a valid value, the alt text will be set to "Image for {productName}".
   */
  @Prop({reflect: true}) imageAltField?: string;

  /**
   * An optional fallback image URL that will be used in case the specified image field is not available or encounters an error.
   */
  @Prop({reflect: true}) fallback?: string;

  public error!: Error;

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

    this.fallback ? (this.useFallback = true) : this.logWarning(message);
  }

  private handleMissingFallback(message: string) {
    if (!this.fallback) {
      this.logWarning(message);
      this.host.remove();
      return null;
    }
    return this.fallback;
  }

  private validateUrl(url: string) {
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

  public render() {
    let url = this.useFallback ? this.fallback : this.url;

    if (!this.useFallback) {
      url = this.validateUrl(url);
      if (!url) {
        return;
      }
    }

    return (
      <img
        alt={this.altText}
        src={filterProtocol(url)}
        onError={() => this.handleImageError()}
        loading="lazy"
      />
    );
  }
}
