import {Product, ProductTemplatesHelpers} from '@coveo/headless/commerce';
import {Component, h, Prop, Element, State, Method} from '@stencil/core';
import {Bindings} from '../../../../components';
import {
  InitializeBindings,
  InitializableComponent,
} from '../../../../utils/initialization-utils';
import {filterProtocol} from '../../../../utils/xss-utils';
import {Carousel} from '../../../common/carousel';
import {ProductContext} from '../product-template-decorators';

/**
 * The `atomic-product-image` component renders an image from a product field.
 */
@Component({
  tag: 'atomic-product-image',
  styleUrl: 'atomic-product-image.pcss',
  shadow: false,
})
export class AtomicProductImage implements InitializableComponent {
  @InitializeBindings() public bindings!: Bindings;
  @ProductContext() private product!: Product;
  @Element() private host!: HTMLElement;
  @State() private useFallback = false;
  @State() private currentImage = 0;

  /**
   * The product field which the component should use. This will look for the field in the product object first, then in the product.additionalFields object.
   */
  @Prop({reflect: true}) field: string = 'ec_thumbnails';

  /**
   * An optional fallback image URL that will be used in case the specified image is not available or an error is encountered.
   */
  @Prop({reflect: true}) fallback?: string;

  public error!: Error;

  /**
   * Moves to the previous image, when the carousel is activated.
   */
  @Method() public async previousImage() {
    this.currentImage =
      this.currentImage - 1 < 0
        ? this.numberOfImages - 1
        : this.currentImage - 1;
  }

  /**
   * Moves to the next image, when the carousel is activated.
   */
  @Method() public async nextImage() {
    this.currentImage = (this.currentImage + 1) % this.numberOfImages;
  }

  private logWarning(message: string) {
    this.bindings.engine.logger.warn(message, this.host);
  }

  private handleImageError(url: string) {
    const message = `The image url "${url}" is not valid or could not be loaded. You might want to add a "fallback" property.`;

    this.fallback ? (this.useFallback = true) : this.logWarning(message);
  }

  private get imageUrls() {
    const value = ProductTemplatesHelpers.getProductProperty(
      this.product,
      this.field
    );

    return Array.isArray(value) ? value : [value];
  }

  private get numberOfImages() {
    return this.images?.length ?? 0;
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

  private get images() {
    return this.imageUrls
      .map((url) => {
        let finalUrl = this.useFallback ? this.fallback : url;

        if (!this.useFallback) {
          finalUrl = this.validateUrl(finalUrl);
          if (!finalUrl) {
            return null;
          }
        }

        return {src: filterProtocol(finalUrl), alt: `${this.field} image`};
      })
      .filter(Boolean);
  }

  private renderCurrentImage(image: {src: string; alt: string} | null) {
    if (image === null) {
      return;
    }

    return (
      <img
        alt={image.alt}
        src={image.src}
        onError={() => this.handleImageError(image.src)}
        loading="lazy"
      />
    );
  }

  public render() {
    if (this.images.length === 1) {
      return this.renderCurrentImage(this.images[this.currentImage]);
    }

    return (
      <div class="pb-4">
        <Carousel
          bindings={this.bindings}
          currentPage={this.currentImage}
          nextPage={() => this.nextImage()}
          previousPage={() => this.previousImage()}
          numberOfPages={this.numberOfImages}
        >
          {this.renderCurrentImage(this.images[this.currentImage])}
        </Carousel>
      </div>
    );
  }
}
