import {isNullOrUndefined} from '@coveo/bueno';
import {type Product, ProductTemplatesHelpers} from '@coveo/headless/commerce';
import {html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {createProductContextController} from '@/src/components/commerce/product-template-component-utils/context/product-context-controller';
import {renderImageCarousel} from '@/src/components/common/image-carousel/image-carousel';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {filterProtocol} from '@/src/utils/xss-utils';
import type {CommerceBindings as Bindings} from '../atomic-commerce-interface/atomic-commerce-interface';

type Image = {
  src: string;
  alt: string;
};

/**
 * The `atomic-product-image` component renders an image from a product field. When the product has multiple images, it displays a carousel with navigation buttons and indicators.
 *
 * @part product-image - The image element that displays the product image.
 * @part previous-button - The container for the previous image button in the carousel.
 * @part next-button - The container for the next image button in the carousel.
 * @part next-icon - The icon for the next image button in the carousel.
 * @part previous-icon - The icon for the previous image button in the carousel.
 * @part indicators - The container for the carousel indicators.
 * @part indicator - The individual indicator for each image in the carousel.
 * @part active-indicator - The currently active indicator in the carousel.
 */
@customElement('atomic-product-image')
@bindings()
@withTailwindStyles
export class AtomicProductImage
  extends LitElement
  implements InitializableComponent<Bindings>
{
  @state() public bindings!: Bindings;

  public productController = createProductContextController(this);

  @state() private product!: Product;

  @state() public error!: Error;
  @state() private useFallback = false;
  @state() private currentImage = 0;

  private isFallbackMissing = false;

  public initialize() {
    if (!this.product && this.productController.item) {
      this.product = this.productController.item;
    }
  }

  /**
   * The product field which the component should use. This will look for the field in the product object first, then in the product.additionalFields object.
   */
  @property({type: String, reflect: true}) field: string = 'ec_thumbnails';

  /**
   * The product field that contains the alt text for the images. This will look for the field in the product object first, then in the product.additionalFields object.
   * If the product has multiple images, the value of the `imageAltField` will be used as the alt text for every image.
   *
   * If the field is not specified, or does not contain a valid value, the alt text will be set to "Image {index} out of {totalImages} for {productName}".
   */
  @property({type: String, reflect: true, attribute: 'image-alt-field'})
  imageAltField?: string;

  /**
   * An fallback image URL that will be used in case the specified image is not available or an error is encountered.
   */
  @property({type: String, reflect: true}) fallback: string =
    // eslint-disable-next-line @cspell/spellchecker
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50"%3E%3Crect width="50" height="50" fill="none" stroke="none"%3E%3C/rect%3E%3C/svg%3E';

  private previousImage() {
    this.currentImage =
      this.currentImage >= 1 ? this.currentImage - 1 : this.numberOfImages - 1;
  }

  private nextImage() {
    this.currentImage = (this.currentImage + 1) % this.numberOfImages;
  }

  private navigateToImage(index: number) {
    if (index < 0 || index >= this.numberOfImages) {
      return;
    }
    this.currentImage = index;
  }

  private logWarning(message: string) {
    this.bindings.engine.logger.warn(message);
  }

  private handleImageError(event: Event) {
    const image = event.target as HTMLImageElement;
    const message = `The image url "${image.src}" is not valid or could not be loaded. You might want to add a "fallback" property.`;
    if (this.fallback && image.src !== this.fallback) {
      this.useFallback = true;
    } else if (image.src === this.fallback) {
      this.logWarning('The fallback image failed to load.');
    } else {
      this.logWarning(message);
    }
  }

  private handleMissingFallback(message: string) {
    if (!this.fallback) {
      this.logWarning(message);
      this.isFallbackMissing = true;
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

  private filterValidImageUrls(): string[] {
    return this.imageUrls.filter(
      (image): image is string => typeof image === 'string'
    );
  }

  private getAltText(
    index: number,
    max: number,
    validImageAlt: string | null
  ): string {
    if (typeof validImageAlt === 'string') {
      return validImageAlt;
    }
    return this.bindings.i18n.t('image-alt-fallback-multiple', {
      count: index + 1,
      max,
      itemName: this.product.ec_name,
    });
  }

  private buildImage(url: string, index: number): Image {
    const finalUrl = this.useFallback ? this.fallback : url;
    this.validateUrl(finalUrl);
    const validImageAlt = this.imageAlt;
    const altText = this.getAltText(
      index,
      this.filterValidImageUrls().length,
      validImageAlt
    );
    return {
      src: filterProtocol(finalUrl),
      alt: altText,
    };
  }

  private get images(): Image[] {
    return this.filterValidImageUrls().map((url, index) =>
      this.buildImage(url, index)
    );
  }

  private get imageUrls() {
    try {
      const value = ProductTemplatesHelpers.getProductProperty(
        this.product,
        this.field
      );

      return Array.isArray(value) ? value : [value];
    } catch (error) {
      this.error = error as Error;
      return [];
    }
  }

  private get imageAlt() {
    if (!this.imageAltField) {
      return null;
    }
    const value = ProductTemplatesHelpers.getProductProperty(
      this.product,
      this.imageAltField
    );
    if (isNullOrUndefined(value)) {
      return null;
    }
    return (value as string).trim();
  }

  private get numberOfImages() {
    return this.images.length;
  }

  private renderCurrentImage(image: Image | null) {
    if (image === null) {
      return nothing;
    }

    return html`
      <img
        part="product-image"
        class="aspect-square w-full h-full object-contain"
        alt=${image.alt}
        src="${image.src}"
        @error=${(event: Event) => this.handleImageError(event)}
        loading="lazy"
      />
    `;
  }

  @bindingGuard()
  @errorGuard()
  render() {
    if (this.product === null || this.product === undefined) {
      return html`${nothing}`;
    }
    if (this.isFallbackMissing) {
      return html`${nothing}`;
    }
    const alt = this.imageAlt
      ? this.imageAlt
      : this.bindings.i18n.t('image-not-found-alt', {
          itemName: this.product.ec_name,
        });

    return html`
      ${when(
        this.images.length === 0,
        () => {
          this.validateUrl(this.fallback);
          return html`
            <img
              part="product-image"
              class="aspect-square w-full h-full object-contain"
              alt=${alt}
              src="${this.fallback}"
              loading="lazy"
            />
          `;
        },
        () =>
          when(
            this.images.length === 1,
            () => this.renderCurrentImage(this.images[this.currentImage]),
            () =>
              renderImageCarousel({
                props: {
                  bindings: this.bindings,
                  currentImage: this.currentImage,
                  navigateToImage: (index: number) =>
                    this.navigateToImage(index),
                  nextImage: () => this.nextImage(),
                  previousImage: () => this.previousImage(),
                  numberOfImages: this.numberOfImages,
                },
              })(this.renderCurrentImage(this.images[this.currentImage]))
          )
      )}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-product-image': AtomicProductImage;
  }
}
