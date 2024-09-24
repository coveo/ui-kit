import {Product, ProductTemplatesHelpers} from '@coveo/headless/commerce';
import {Component, h, Prop, Element, State, Method} from '@stencil/core';
import {
  InitializableComponent,
  InitializeBindings,
} from '../../../../utils/initialization-utils';
import {filterProtocol} from '../../../../utils/xss-utils';
import {ImageCarousel} from '../../../common/image-carousel/image-carousel';
import {CommerceBindings as Bindings} from '../../atomic-commerce-interface/atomic-commerce-interface';
import {ProductContext} from '../product-template-decorators';

type Image = {
  src: string;
  alt: string;
};

/**
 * The `atomic-product-image` component renders an image from a product field.
 * @alpha
 */
@Component({
  tag: 'atomic-product-image',
  styleUrl: 'atomic-product-image.pcss',
  shadow: true,
})
export class AtomicProductImage implements InitializableComponent<Bindings> {
  @InitializeBindings() public bindings!: Bindings;
  @ProductContext() private product!: Product;
  @Element() private host!: HTMLElement;
  @State() private useFallback = false;
  @State() private currentImage = 0;
  @State() private images: Image[] = [];

  public error!: Error;

  /**
   * The product field which the component should use. This will look for the field in the product object first, then in the product.additionalFields object.
   */
  @Prop({reflect: true}) field: string = 'ec_thumbnails';

  /**
   * The product field that contains the alt text for the images. This will look for the field in the product object first, then in the product.additionalFields object.
   * The field can be a string or an array of strings.
   *
   * If the value of the field is a string, it will be used as the alt text for all the images.
   *
   * If the value of the field is an array of strings, the alt text will be used in the order of the images.
   *
   * If the field is not specified, or does not contain a valid value, the alt text will be set to "Image {index} out of {totalImages} for {productName}".
   */
  @Prop({reflect: true}) imageAltField?: string;

  /**
   * An fallback image URL that will be used in case the specified image is not available or an error is encountered.
   */
  @Prop({reflect: true}) fallback: string =
    // eslint-disable-next-line @cspell/spellchecker
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50"%3E%3Crect width="50" height="50" fill="none" stroke="none"%3E%3C/rect%3E%3C/svg%3E';

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

  /**
   * Navigates to the specified image index.
   *
   * @param index - The index of the image to navigate to.
   */
  @Method() public async navigateToImage(index: number) {
    this.currentImage = index;
  }

  private logWarning(message: string) {
    this.bindings.engine.logger.warn(message, this.host);
  }

  private handleImageError(event: Event) {
    const image = event.target as HTMLImageElement;
    const message = `The image url "${image.src}" is not valid or could not be loaded. You might want to add a "fallback" property.`;
    if (this.fallback && image.src !== this.fallback) {
      this.useFallback = true;
      image.src = this.fallback;
    } else if (image.src === this.fallback) {
      this.logWarning('The fallback image failed to load.');
    } else {
      this.logWarning(message);
    }
  }

  private handleMissingFallback(message: string) {
    if (!this.fallback) {
      this.logWarning(message);
      this.host.remove();
      return null;
    }
    return this.fallback;
  }

  private validateUrl(url: string | undefined) {
    if (!url) {
      const message = `Image for ${this.product.ec_name} is missing. Please review your indexing. You might want to add a "fallback" property.`;
      return this.handleMissingFallback(message);
    }

    if (typeof url !== 'string') {
      const message = `Expected "${this.field}" to be a text field. Please review your indexing. You might want to add a "fallback" property.`;
      return this.handleMissingFallback(message);
    }

    return url;
  }

  componentWillLoad(): void {
    const validImages = this.imageUrls.filter(
      (image) => typeof image === 'string'
    );

    const validImageAlt = this.imageAlt;

    this.images = validImages.map((url, index) => {
      const finalUrl = this.useFallback ? this.fallback : url;

      this.validateUrl(finalUrl);
      let altText;

      if (Array.isArray(validImageAlt) && validImageAlt[index]) {
        altText = validImageAlt[index];
      } else if (typeof validImageAlt === 'string') {
        altText = validImageAlt;
      } else {
        altText = this.bindings.i18n.t('image-alt-fallback-multiple', {
          count: index + 1,
          max: validImages?.length,
          itemName: this.product.ec_name,
        });
      }

      return {
        src: filterProtocol(finalUrl),
        alt: altText,
      };
    }) as Image[];
  }

  private get imageUrls() {
    const value = ProductTemplatesHelpers.getProductProperty(
      this.product,
      this.field
    );

    return Array.isArray(value) ? value : [value];
  }

  private get imageAlt() {
    if (this.imageAltField) {
      const value = ProductTemplatesHelpers.getProductProperty(
        this.product,
        this.imageAltField
      );

      if (Array.isArray(value)) {
        return value.map((v) => `${v}`.trim());
      }
      return (value as string).trim();
    }
    return null;
  }

  private get numberOfImages() {
    return this.images?.length ?? 0;
  }

  private renderCurrentImage(image: Image | null) {
    if (image === null) {
      return;
    }

    return (
      <img
        class="aspect-square"
        alt={image.alt}
        src={image.src}
        onError={(image) => this.handleImageError(image)}
        loading="lazy"
      />
    );
  }

  public render() {
    const imagesToRender = this.images.map((image: Image) => {
      return {
        src: image.src,
        alt: image.alt,
      };
    });
    if (this.images.length === 0) {
      this.validateUrl(this.fallback);

      return (
        <img
          alt={this.bindings.i18n.t('image-not-found-alt')}
          src={this.fallback}
          loading="eager"
        />
      );
    }
    if (this.images.length === 1) {
      return this.renderCurrentImage(imagesToRender[this.currentImage]);
    }

    return (
      // TODO: handle small/icon image sizes better on mobile
      <ImageCarousel
        bindings={this.bindings}
        currentImage={this.currentImage}
        navigateToImage={(index) => this.navigateToImage(index)}
        nextImage={() => this.nextImage()}
        previousImage={() => this.previousImage()}
        numberOfImages={this.numberOfImages}
      >
        {this.renderCurrentImage(this.images[this.currentImage])}
      </ImageCarousel>
    );
  }
}
