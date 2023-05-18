import {Result, ResultTemplatesHelpers} from '@coveo/headless';
import {Component, h, Prop, Element} from '@stencil/core';
import {
  InitializeBindings,
  InitializableComponent,
} from '../../../../utils/initialization-utils';
import {filterProtocol} from '../../../../utils/xss-utils';
import {Bindings} from '../../atomic-search-interface/atomic-search-interface';
import {ResultContext} from '../result-template-decorators';

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

  /**
   * The result field which the component should use. This will look for the field in the Result object first, then in the Result.raw object. It is important to include the necessary field in the `atomic-search-interface` component.
   */
  @Prop({reflect: true}) field!: string;

  /**
   * An optional fallback image URL or local image file path that will be used in case the specified image field is not available or encounters a 404 error.
   * If the `field` prop is not specified or does not contain a valid image URL, this fallback URL will be used instead.
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
  private handleImageError() {
    if (this.fallback) {
      this.host.querySelector('img')!.src = this.fallback;
    } else {
      // Handle the case when fallback is not provided
      // You can customize this behavior according to your needs
      this.host.remove();
    }
  }
  private getRenderUrl(): string {
    if (!this.url) {
      if (!this.fallback) {
        this.bindings.engine.logger.error(
          `"${this.field}" is missing. Please add a "fallback" property.`,
          this.host
        );
        this.host.remove();
      } else {
        return this.fallback;
      }
    }
    if (typeof this.url !== 'string') {
      this.bindings.engine.logger.error(
        `Expected "${this.field}" to be a text field.`,
        this.host
      );
      if (this.fallback) {
        return this.fallback;
      } else {
        this.bindings.engine.logger.error(
          `"${this.field}" is not a text field. Please add a "fallback" property.`,
          this.host
        );
        this.host.remove();
      }
    }
    return this.url;
  }
  public render() {
    const url = this.getRenderUrl();
    return (
      <img
        alt={`${this.field} image`}
        src={filterProtocol(url)}
        onError={() => this.handleImageError()}
        loading="lazy"
      />
    );
  }
}
