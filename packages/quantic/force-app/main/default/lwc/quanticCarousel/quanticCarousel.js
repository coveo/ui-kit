import {getBueno} from 'c/quanticHeadlessLoader';
import {LightningElement, api} from 'lwc';

/**
 * The `QuanticCarousel` component displays the content provided in a carousel. This component also displays navigation buttons that allow the end user to navigate between the different pages of the carousel.
 * @category Utility
 * @example
 * <c-quantic-carousel number-of-pages="2" number-of-items-per-page="1">
 *   <div slot="carousel-item">Item One</div>
 *   <div slot="carousel-item">Item Two</div>
 * </c-quantic-carousel>
 */
export default class QuanticCarousel extends LightningElement {
  /**
   * The total number of pages.
   * @api
   * @type {number}
   */
  @api numberOfPages;
  /**
   * The number of items to display per page.
   * @api
   * @type {number}
   */
  @api numberOfItemsPerPage;
  /**
   * The index of the current page.
   * @api
   * @type {number}
   */
  @api
  get currentPage() {
    return this._currentPage;
  }
  set currentPage(value) {
    this._currentPage = value;
  }

  /** @type {number} */
  _currentPage = 0;
  /** @type {boolean} */
  hasInitializationError = false;

  connectedCallback() {
    getBueno(this).then(() => {
      if (!this.numberOfPages || !this.numberOfItemsPerPage) {
        console.error(
          `The ${this.template.host.localName} requires a result and a number field to be specified.`
        );
        this.setInitializationError();
      }
      // if (!Bueno.isNumber(this.fieldValue)) {
      //   console.error(`The "${this.field}" field value is not a valid number.`);
      //   this.setError();
      // }
      this.validated = true;
    });
  }

  renderedCallback() {
    this.hideNonVisibleSlides();
  }

  hideNonVisibleSlides() {
    /** @type {HTMLSlotElement} */
    const slot = this.template.querySelector('slot[name="carousel-item"]');
    const items = slot.assignedNodes();

    items.forEach((item, index) => {
      const isDisplayedInCurrentPage =
        Math.floor(index / this.numberOfItemsPerPage) === this._currentPage;
      if (!isDisplayedInCurrentPage) {
        // @ts-ignore
        item.style.display = 'none';
      } else {
        // @ts-ignore
        item.style.display = '';
      }
    });
  }

  handlePrevious() {
    // eslint-disable-next-line @lwc/lwc/no-api-reassignments
    this.currentPage = this._currentPage - 1;
  }

  handleNext() {
    // eslint-disable-next-line @lwc/lwc/no-api-reassignments
    this.currentPage = this._currentPage + 1;
  }

  /**
   * Sets the component in the initialization error state.
   */
  setInitializationError() {
    this.hasInitializationError = true;
  }

  get previousButtonIsDisabled() {
    return this._currentPage === 0;
  }

  get nextButtonIsDisabled() {
    return this._currentPage === this.numberOfPages - 1;
  }

  get carouselIndicators() {
    const indicatorCSSClass =
      'carousel__indicator slds-var-m-horizontal_xx-small';
    return Array.from({length: this.numberOfPages}, (_item, index) => ({
      index,
      handleClick: () => {
        this._currentPage = index;
      },
      title: `Go to page ${index + 1}`,
      current: index === this._currentPage,
      class:
        index === this._currentPage
          ? indicatorCSSClass + ' carousel__indicator--active'
          : indicatorCSSClass,
    }));
  }
}
