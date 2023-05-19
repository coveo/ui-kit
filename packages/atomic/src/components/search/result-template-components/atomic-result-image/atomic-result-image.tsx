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

  private handleImageError(target: EventTarget | null) {
    const image = target as HTMLImageElement;

    if (image.src === this.fallback) {
      return;
    }

    if (this.fallback) {
      image.src = this.fallback;
    } else {
      this.bindings.engine.logger.warn(
        `The image url "${image.src}" is not valid or could not be loaded. You might want to add a "fallback" property.`,
        this.host
      );
    }
  }

  private handleMissingFallback(message: string) {
    if (!this.fallback) {
      message += ' You might want to add a "fallback" property.';
      this.bindings.engine.logger.warn(message, this.host);
      this.host.remove();
      return null;
    }
    return this.fallback;
  }

  public render() {
    let url = this.url;

    if (!url) {
      const message = `"${this.field}" is missing. Please review your indexation.`;
      url = this.handleMissingFallback(message);
      if (!url) {
        return;
      }
    }

    if (url && typeof url !== 'string') {
      const message = `Expected "${this.field}" to be a text field. Please review your indexation.`;
      url = this.handleMissingFallback(message);
      if (!url) {
        return;
      }
    }
    return (
      <img
        alt={`${this.field} image`}
        src={filterProtocol(url)}
        onError={(e) => this.handleImageError(e.target)}
        loading="lazy"
      />
    );
  }
}
