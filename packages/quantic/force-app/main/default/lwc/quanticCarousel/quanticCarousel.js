import goToPage from '@salesforce/label/c.quantic_GoToPage';
import invalidPositiveIntegerProperty from '@salesforce/label/c.quantic_InvalidPositiveIntegerProperty';
import nextPage from '@salesforce/label/c.quantic_NextPage';
import previousPage from '@salesforce/label/c.quantic_PreviousPage';
import propertyIsRequired from '@salesforce/label/c.quantic_PropertyIsRequired';
import {I18nUtils} from 'c/quanticUtils';
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
  labels = {
    propertyIsRequired,
    invalidPositiveIntegerProperty,
    nextPage,
    previousPage,
    goToPage,
  };

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
  /** @type {string} */
  errorMessage = '';

  connectedCallback() {
    this.validateProperties();
  }

  renderedCallback() {
    this.hideNonVisibleSlides();
  }

  validateProperties() {
    if (!this.numberOfPages || !this.numberOfItemsPerPage) {
      this.setInitializationError(
        I18nUtils.format(
          this.labels.propertyIsRequired,
          !this.numberOfPages ? 'numberOfPages' : 'numberOfItemsPerPage'
        )
      );
    } else if (isNaN(this.numberOfPages) || isNaN(this.numberOfItemsPerPage)) {
      this.setInitializationError(
        I18nUtils.format(
          this.labels.invalidPositiveIntegerProperty,
          isNaN(this.numberOfPages) ? 'numberOfPages' : 'numberOfItemsPerPage'
        )
      );
    }
  }

  hideNonVisibleSlides() {
    /** @type {HTMLSlotElement} */
    const slot = this.template.querySelector('slot[name="carousel-item"]');
    const items = slot?.assignedNodes();

    items?.forEach((item, index) => {
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
    this._currentPage = this._currentPage - 1;
  }

  handleNext() {
    this._currentPage = this._currentPage + 1;
  }

  /**
   * Sets the component in the initialization error state.
   */
  setInitializationError(message) {
    console.error(message);
    this.errorMessage = message;
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
    return Array.from({length: this.numberOfPages}, (_item, index) => {
      const isCurrent = index === this._currentPage;
      return {
        index,
        handleClick: () => {
          this._currentPage = index;
        },
        title: I18nUtils.format(this.labels.goToPage, index + 1),
        current: isCurrent,
        class: isCurrent
          ? indicatorCSSClass + ' carousel__indicator--active'
          : indicatorCSSClass,
      };
    });
  }
}
